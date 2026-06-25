import { Module } from "@nestjs/common";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { DbModule } from "./db/db.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    AuthModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, 
    },
  ],
})
export class AppModule {}