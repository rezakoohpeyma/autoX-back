import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { ConfigModule } from "@nestjs/config"
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
@Module({
	 imports: [
    ConfigModule.forRoot(),
     ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
     AuthModule,
     UsersModule,
  ],
	controllers: [],
	providers: [],
})
export class AppModule {}
