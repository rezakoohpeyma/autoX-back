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
import { PaginationOptions } from "../../../../../../utils/types/pagination-options";
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

	private buildOrderBy(sortOptions?: SortUserDto[] | null): SQL[] {
		return (
			sortOptions?.map((sort) => {
				const dir = sort.order === "asc" ? asc : desc;
				switch (sort.orderBy) {
					case "email":
						return dir(users.email);
					case "firstName":
						return dir(users.firstName);
					case "lastName":
						return dir(users.lastName);
					case "createdAt":
						return dir(users.createdAt);
					default:
						return dir(users.id);
				}
			}) ?? [asc(users.id)]
		);
	}

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
	}) {
		const conditions: SQL[] = [isNull(users.deletedAt)];

		if (filterOptions?.isActive !== undefined) {
			conditions.push(eq(users.isActive, filterOptions.isActive));
		}

		const result = await this.drizzle
			.select()
			.from(users)
			.where(and(...conditions))
			.orderBy(...this.buildOrderBy(sortOptions))
			.limit(paginationOptions.limit)
			.offset((paginationOptions.page - 1) * paginationOptions.limit);

		return result.map(UserMapper.toDomain);
	}

	async getDeletedUsers({ filterOptions, sortOptions, paginationOptions }) {
		const conditions: SQL[] = [isNotNull(users.deletedAt)];

		if (filterOptions?.isActive !== undefined) {
			conditions.push(eq(users.isActive, filterOptions.isActive));
		}

		const result = await this.drizzle
			.select()
			.from(users)
			.where(and(...conditions))
			.orderBy(...this.buildOrderBy(sortOptions))
			.limit(paginationOptions.limit)
			.offset((paginationOptions.page - 1) * paginationOptions.limit);

		return result.map(UserMapper.toDomain);
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
	async findByPhoneNumber(phoneNumber: string): Promise<NullableType<User>> {
    const [userEntity] = await this.drizzle
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1);

    if (!userEntity) {
      return null;
    }

    return UserMapper.toDomain(userEntity);
  }

	async findByIds(ids: UserRow["id"][]): Promise<UserRow[]> {
		const result = await this.drizzle
			.select()
			.from(users)
			.where(inArray(users.id, ids));
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

	async count(
		filterOptions?: FilterUserDto | null,
		isDeleted: boolean = false,
	): Promise<number> {
		const conditions: SQL[] = [];

		if (isDeleted) {
			conditions.push(isNotNull(users.deletedAt));
		} else {
			conditions.push(isNull(users.deletedAt));
		}

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
