export class UserResponseDto {
	id!: number;
	email!: string | null;

	phoneNumber!: string;

	firstName!: string | null;
	lastName!: string | null;

	isActive!: boolean | null;
	createdAt!: Date;
	updatedAt!: Date;
	deletedAt!: Date | null;
}
