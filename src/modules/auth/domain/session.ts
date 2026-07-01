export class Session {
	id!: number;
	userId!: number;
	hash!: string;
	createdAt!: Date;
	deletedAt!: Date | null;
}
