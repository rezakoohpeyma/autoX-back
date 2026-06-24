import { Module } from "@nestjs/common";
import { UserRepository } from "../user.repository";
import { DrizzleUserRepository } from "./repositories/user.repository";

@Module({
	providers: [
		{
			provide: UserRepository,
			useClass: DrizzleUserRepository,
		},
	],
	exports: [UserRepository],
})
export class DrizzleUserPersistenceModule {}
