import { Inject, Injectable } from "@nestjs/common";
import {
	and,
	asc,
	count,
	desc,
	eq,
	inArray,
	isNotNull,
	isNull,
	SQL,
} from "drizzle-orm";
import { NullableType } from "../../../../../../utils/types/nullable.type";
import { UserMapper } from "../mappers/user.mapper";
import { users } from "../schema/users.schema";
import { IPaginationOptions } from "../../../../../../utils/types/pagination-options";
import { DeepPartial } from "../../../../../../utils/types/deep-partial.type";
import { UserRepository } from "../../user.repository";
import { DB } from "../../../../../../db/db.token";
import type { DB as Database } from "../../../../../../db";
import { UserRow } from "../../../../types/user";
import { User } from "../../../../domain/user";
import { CreateUserDto } from "../../../../dto/create-user.dto";
import { ChangeUserStatusDto } from "../../../../dto/change-user-status-dto";
import { FilterUserDto, SortUserDto } from "../../../../dto/query-user.dto";

@Injectable()
export class DrizzleUserRepository implements UserRepository {
	constructor(@Inject(DB) private readonly drizzle: Database) {}

	async create(data: CreateUserDto): Promise<UserRow> {
		const persistenceModel = UserMapper.toPersistence(data);
		const [newEntity] = await this.drizzle
			.insert(users)
			.values(persistenceModel)
			.returning();

		return UserMapper.toDomain(newEntity);
	}

	async findManyWithPagination({
		filterOptions,
		sortOptions,
		paginationOptions,
	}: {
		filterOptions?: FilterUserDto | null;
		sortOptions?: SortUserDto[] | null;
		paginationOptions: IPaginationOptions;
	}): Promise<User[]> {
		console.log(filterOptions);
		console.log(sortOptions);
		console.log(paginationOptions);

		const conditions: SQL[] = [isNull(users.deletedAt)];

		if (filterOptions?.isActive !== undefined) {
			conditions.push(eq(users.isActive, filterOptions.isActive));
		}

		const orderBy = sortOptions?.map((sort) => {
			switch (sort.orderBy) {
				case "id":
					return sort.order === "asc" ? asc(users.id) : desc(users.id);

				case "email":
					return sort.order === "asc" ? asc(users.email) : desc(users.email);

				case "firstName":
					return sort.order === "asc"
						? asc(users.firstName)
						: desc(users.firstName);

				case "lastName":
					return sort.order === "asc"
						? asc(users.lastName)
						: desc(users.lastName);

				case "createdAt":
					return sort.order === "asc"
						? asc(users.createdAt)
						: desc(users.createdAt);

				default:
					return asc(users.id);
			}
		}) ?? [asc(users.id)];

		const result = await this.drizzle
			.select()
			.from(users)
			.where(and(...conditions))
			.orderBy(...orderBy)
			.limit(paginationOptions.limit)
			.offset((paginationOptions.page - 1) * paginationOptions.limit);

		return result.map((user) => UserMapper.toDomain(user));
	}

	async getDeletedUsers({
		filterOptions,
		sortOptions,
		paginationOptions,
	}: {
		filterOptions?: FilterUserDto | null;
		sortOptions?: SortUserDto[] | null;
		paginationOptions: IPaginationOptions;
	}): Promise<User[]> {
		console.log(filterOptions);
		console.log(sortOptions);
		console.log(paginationOptions);

		const conditions: SQL[] = [];

		if (filterOptions?.isActive !== undefined) {
			conditions.push(eq(users.isActive, filterOptions.isActive));
		}
		const orderBy = sortOptions?.map((sort) => {
			switch (sort.orderBy) {
				case "id":
					return sort.order === "asc" ? asc(users.id) : desc(users.id);

				case "email":
					return sort.order === "asc" ? asc(users.email) : desc(users.email);

				case "firstName":
					return sort.order === "asc"
						? asc(users.firstName)
						: desc(users.firstName);

				case "lastName":
					return sort.order === "asc"
						? asc(users.lastName)
						: desc(users.lastName);

				case "createdAt":
					return sort.order === "asc"
						? asc(users.createdAt)
						: desc(users.createdAt);

				default:
					return asc(users.id);
			}
		}) ?? [asc(users.id)];

		const result = await this.drizzle
			.select()
			.from(users)
			.where(and(isNotNull(users.deletedAt), ...conditions))
			.orderBy(...orderBy)
			.limit(paginationOptions.limit)
			.offset((paginationOptions.page - 1) * paginationOptions.limit);

		return result.map((user) => UserMapper.toDomain(user));
	}

	async restore(id: User["id"]): Promise<User> {
		const [user] = await this.drizzle
			.update(users)
			.set({
				deletedAt: null,
				updatedAt: new Date(),
			})
			.where(eq(users.id, id))
			.returning();

		return user;
	}

	async findById(id: UserRow["id"]): Promise<NullableType<UserRow>> {
		const [result] = await this.drizzle
			.select()
			.from(users)
			.where(and(eq(users.id, id)))
			.limit(1);
		return result ? UserMapper.toDomain(result) : null;
	}

	async findByIds(ids: UserRow["id"][]): Promise<UserRow[]> {
		const numericIds = ids.map((id) =>
			typeof id === "string" ? parseInt(id, 10) : id,
		);
		const result = await this.drizzle
			.select()
			.from(users)
			.where(inArray(users.id, numericIds));
		return result.map(UserMapper.toDomain);
	}

	async changeStatus(dto: ChangeUserStatusDto): Promise<User[]> {
		return await this.drizzle
			.update(users)
			.set({
				isActive: dto.isActive,
				updatedAt: new Date(),
			})
			.where(inArray(users.id, dto.ids))
			.returning();
	}

	async update(
		id: UserRow["id"],
		payload: DeepPartial<UserRow>,
	): Promise<UserRow | null> {
		const persistence = UserMapper.toPersistence(payload as UserRow);

		const [updated] = await this.drizzle
			.update(users)
			.set(persistence)
			.where(and(eq(users.id, id), isNull(users.deletedAt)))
			.returning();

		return updated ? UserMapper.toDomain(updated) : null;
	}

	async remove(id: UserRow["id"]): Promise<void> {
		await this.drizzle
			.update(users)
			.set({ deletedAt: new Date() })
			.where(eq(users.id, id));
	}

	async count(filterOptions?: FilterUserDto | null): Promise<number> {
	const conditions: SQL[] = [];

	if (filterOptions?.isActive !== undefined) {
		conditions.push(eq(users.isActive, filterOptions.isActive));
	}

	const result = await this.drizzle
		.select({ value: count() })
		.from(users)
		.where(and(...conditions));

	return result[0].value;
}
}