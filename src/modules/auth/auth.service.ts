import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
	UnprocessableEntityException,
} from "@nestjs/common";
import crypto from "crypto";
import ms from "ms";
import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { User } from "../users/domain/user";
import { UserMapper } from "../users/infrastructure/persistence/drizzle/mappers/user.mapper";
import { UsersService } from "../users/users.service";
import { AuthResetPasswordDto } from "./dto/auth-reset-password.dto";
import  { LoginDto } from "./dto/login.dto";
import  { AuthResponseDto } from "./dto/login-response.dto";
import  { RegisterDto } from "./dto/register.dto";
import { SessionRepository } from "./infrastructure/persistence/session.repository";
import { compareHash, hashValue } from "../../utils/hash.util";

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly sessionRepository: SessionRepository,
	) {}

	async validateLogin(loginDto: LoginDto): Promise<AuthResponseDto> {
		const user = await this.usersService.findByPhoneNumber(
			loginDto.phoneNumber,
		);
		if (!user || !user.isActive) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const isPasswordValid = await compareHash(loginDto.password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException("Invalid credentials");
		}

		return this.generateAuthResponse(user);
	}

	async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
		const user = await this.usersService.create(registerDto);

		return this.generateAuthResponse(user!);
	}

	async refreshToken(
		userId: number,
		sessionId: number,
		rawRefreshToken: string,
	): Promise<Omit<AuthResponseDto, "user">> {
		const user = await this.usersService.findById(userId);
		if (!user || !user.isActive) {
			throw new UnauthorizedException("Unauthorized access");
		}

		const session = await this.sessionRepository.findById(sessionId);
		if (!session) {
			throw new UnauthorizedException("Session has expired");
		}

		const isTokenValid = await compareHash(rawRefreshToken, session.hash);
		if (!isTokenValid) {
			throw new UnauthorizedException("Invalid refresh token");
		}

		await this.sessionRepository.delete(session.id);
		const newAuthResponse = await this.generateAuthResponse(user);

		return {
			token: newAuthResponse.token,
			refreshToken: newAuthResponse.refreshToken,
			tokenExpires: newAuthResponse.tokenExpires,
		};
	}

	async resetPassword(dto: AuthResetPasswordDto): Promise<void> {
		const user = await this.usersService.findByPhoneNumber(dto.phoneNumber);
		if (!user) {
			throw new NotFoundException("User not found");
		}

		if (dto.otpCode !== "00000") {
			throw new BadRequestException("Invalid OTP code");
		}

		const hashedPassword = await hashValue(dto.password);
		await this.usersService.update(user.id, { password: hashedPassword });

		await this.sessionRepository.deleteByUserId(user.id);
	}

	async logout(sessionId: number): Promise<void> {
		await this.sessionRepository.delete(sessionId);
	}

	private async generateAuthResponse(user: User): Promise<AuthResponseDto> {
		const hash = crypto
			.createHash("sha256")
			.update(randomStringGenerator())
			.digest("hex");

		const session = await this.sessionRepository.create({
			userId: user.id,
			hash: hash,
		});

		const payload = {
			sub: user.id,
			phoneNumber: user.phoneNumber,
			sessionId: session.id,
		};

		const tokenExpiresIn =
			this.configService.get<string>("JWT_ACCESS_TOKEN_EXPIRES_IN") || "15m";
		const refreshExpiresIn =
			this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRES_IN") || "7d";

		const [token, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload, {
				secret: this.configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
				expiresIn: tokenExpiresIn as any,
			}),
			this.jwtService.signAsync(payload, {
				secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
				expiresIn: refreshExpiresIn as any,
			}),
		]);

		// 2. Hash the refresh token and save it into the DB
		const hashedRefreshToken = await hashValue(refreshToken);
		await this.sessionRepository.update(session.id, {
			hash: hashedRefreshToken,
		});

		return {
			token,
			refreshToken,
			tokenExpires: Date.now() + ms(tokenExpiresIn),
			user: user!,
		};
	}
}
