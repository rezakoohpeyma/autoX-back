import { Exclude, Expose } from "class-transformer";
import { UserRow } from "../types/user";

export class User implements UserRow {
	id!: number;

	@Expose({ groups: ["me", "admin"] })
	email!: string | null;

	@Exclude()
	password!: string;

	firstName!: string;

	lastName!: string;

	@Expose({ groups: ["me", "admin"] })
	phoneNumber!: string;

	isActive!: boolean;

	createdAt!: Date;

	updatedAt!: Date;

	deletedAt!: Date | null;
}
