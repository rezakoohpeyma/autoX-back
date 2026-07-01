import { Module } from "@nestjs/common";
import { DrizzleUserPersistenceModule } from "./infrastructure/persistence/drizzle/drizzle-persistence.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
	imports: [DrizzleUserPersistenceModule],
	providers: [UsersService],
	controllers: [UsersController],
	exports: [UsersService],
})
export class UsersModule {}
