import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import {ConfigModule} from "@nestjs/config"
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
  ],
	controllers: [],
	providers: [],
})
export class AppModule {}
