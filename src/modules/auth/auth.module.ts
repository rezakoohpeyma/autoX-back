import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { DrizzleSessionRepository } from "./infrastructure/persistence/drizzle/repositories/session.repository";
import { SessionRepository } from "./infrastructure/persistence/session.repository";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";

@Module({
	imports: [
		UsersModule,
		CacheModule.register(),
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.get<string>("JWT_ACCESS_SECRET"),
			}),
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtStrategy,
		JwtRefreshStrategy,
		{
			provide: SessionRepository,
			useClass: DrizzleSessionRepository,
		},
	],
})
export class AuthModule {}
