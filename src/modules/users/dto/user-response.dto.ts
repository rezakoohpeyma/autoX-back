import { Expose } from "class-transformer";

export class UserResponseDto {
	id!: number;

	firstName!: string | null;
	lastName!: string | null;
	@Expose({ groups: ["me", "admin"] })
	email!: string | null;
    
	@Expose({ groups: ["me", "admin"] })
	phoneNumber!: string;
	isActive!: boolean | null;
	createdAt!: Date;
	updatedAt!: Date;
	deletedAt!: Date | null;
}
