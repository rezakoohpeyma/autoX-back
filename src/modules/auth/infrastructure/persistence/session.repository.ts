import type { Session } from "../../domain/session";

export abstract class SessionRepository {
	abstract create(data: Pick<Session, "userId" | "hash">): Promise<Session>;
	abstract findById(id: number): Promise<Session | null>;
	abstract update(id: number, payload: Partial<Session>): Promise<void>;
	abstract delete(id: number): Promise<void>;
	abstract deleteByUserId(userId: number): Promise<void>;
}
