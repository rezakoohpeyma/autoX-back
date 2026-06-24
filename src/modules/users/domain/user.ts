export class User {
	id!: number;

	email!: string | null;

	firstName!: string | null;

	lastName!: string | null;

	phoneNumber!: string;

	isActive!: boolean;
	password!: string;
	createdAt!: Date;

	updatedAt!: Date;

	deletedAt!: Date | null;
}
