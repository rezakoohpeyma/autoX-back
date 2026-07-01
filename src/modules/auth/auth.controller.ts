import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	SerializeOptions,
	UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import type { AuthResetPasswordDto } from "./dto/auth-reset-password.dto";
import type { LoginDto } from "./dto/login.dto";
import type { AuthResponseDto } from "./dto/login-response.dto";
import type { RegisterDto } from "./dto/register.dto";
import { User } from "../users/domain/user";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("login")
	@HttpCode(HttpStatus.OK)
	async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
		return this.authService.validateLogin(loginDto);
	}

	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	async register(
		@Body() registerDto: RegisterDto,
	): Promise<AuthResponseDto> {
		return this.authService.register(registerDto);
	}

	@Post("refresh")
	@UseGuards(AuthGuard("jwt-refresh"))
	@HttpCode(HttpStatus.OK)
	async refresh(
		@Req() request: any,
	): Promise<Omit<AuthResponseDto, "user">> {
		return this.authService.refreshToken(
			request.user.sub,
			request.user.sessionId,
			request.user.refreshToken,
		);
	}

	@Post("logout")
	@UseGuards(AuthGuard("jwt"))
	@HttpCode(HttpStatus.NO_CONTENT)
	async logout(@Req() request: any): Promise<void> {
		await this.authService.logout(request.user.sessionId);
	}

	@Post("reset-password")
	@HttpCode(HttpStatus.NO_CONTENT)
	async resetPassword(
		@Body() resetPasswordDto: AuthResetPasswordDto,
	): Promise<void> {
		return this.authService.resetPassword(resetPasswordDto);
	}

	@Get("me")
	@SerializeOptions({ groups: ["me"] })
	@UseGuards(AuthGuard("jwt"))
	@HttpCode(HttpStatus.OK)
	me(@Req() request: any): User {
		return request.user;
	}
}
