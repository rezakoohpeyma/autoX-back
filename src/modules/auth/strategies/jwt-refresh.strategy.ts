import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { JwtPayloadType } from "../types/jwt-payload.type";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	"jwt-refresh",
) {
	constructor(private readonly configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
			passReqToCallback: true,
		});
	}

	async validate(request: Request, payload: JwtPayloadType) {
		const refreshToken = request
			.get("Authorization")
			?.replace("Bearer", "")
			.trim();
		if (!refreshToken) {
			throw new UnauthorizedException("Refresh token is missing");
		}

		// Pass everything down to the controller
		return { ...payload, refreshToken };
	}
}
