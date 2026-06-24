import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { DrizzleUserPersistenceModule } from "./infrastructure/persistence/drizzle/drizzle-persistence.module";

@Module({
	imports: [DrizzleUserPersistenceModule],
	providers: [UsersService],
	controllers: [UsersController],
})
export class UsersModule {}
