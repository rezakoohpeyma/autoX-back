import { Inject, Injectable } from "@nestjs/common";
import { and, eq, isNull } from "drizzle-orm";
import type { DB as Database } from "../../../../../../db";
import { DB } from "../../../../../../db/db.token";
import type { Session } from "../../../../domain/session";
import { SessionRepository } from "../../session.repository";
import { sessions } from "../schema/sessions.schema";

@Injectable()
export class DrizzleSessionRepository implements SessionRepository {
	constructor(@Inject(DB) private readonly drizzle: Database) {}

	async create(data: Pick<Session, "userId" | "hash">): Promise<Session> {
		const [session] = await this.drizzle
			.insert(sessions)
			.values(data)
			.returning();
		return session;
	}

	async findById(id: number): Promise<Session | null> {
		const [session] = await this.drizzle
			.select()
			.from(sessions)
			.where(and(eq(sessions.id, id), isNull(sessions.deletedAt)))
			.limit(1);

		return session || null;
	}

	async update(id: number, payload: Partial<Session>): Promise<void> {
		await this.drizzle.update(sessions).set(payload).where(eq(sessions.id, id));
	}

	async delete(id: number): Promise<void> {
		await this.drizzle
			.update(sessions)
			.set({ deletedAt: new Date() })
			.where(eq(sessions.id, id));
	}

	async deleteByUserId(userId: number): Promise<void> {
		await this.drizzle
			.update(sessions)
			.set({ deletedAt: new Date() })
			.where(and(eq(sessions.userId, userId), isNull(sessions.deletedAt)));
	}
}
