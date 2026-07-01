import { Inject, Injectable } from "@nestjs/common";
import {
	and,
	asc,
	count,
	desc,
	eq,
	gte,
	ilike,
	inArray,
	isNotNull,
	isNull,
	lte,
	or,
	type SQL,
} from "drizzle-orm";
import type { DB as Database } from "../../../../../../db";
import { DB } from "../../../../../../db/db.token";
import type { DeepPartial } from "../../../../../../utils/types/deep-partial.type";
import type { NullableType } from "../../../../../../utils/types/nullable.type";
import type { User } from "../../../../domain/user";
import type { ChangeUserStatusDto } from "../../../../dto/change-user-status-dto";
import  { CreateUserDto } from "../../../../dto/create-user.dto";
import type { UserRow } from "../../../../types/user";
import { UserMapper } from "../mappers/user.mapper";
import { users } from "../schema/users.schema";
import { UserSortField } from "../../../../enums/user.enums";
import { SortOrder } from "../../../../../../common/enums/sort-order";

import { 
    UserRepository, 
    UserRepositorySort, 
    UserRepositoryFilter, 
    FindManyUsersCriteria, 
    ChangeUserStatusPayload 
} from "../../user.repository";
@Injectable()
export class DrizzleUserRepository implements UserRepository {
	constructor(@Inject(DB) private readonly drizzle: Database) {}
    private readonly sortColumnMap = {
        [UserSortField.EMAIL]: users.email,
        [UserSortField.FIRST_NAME]: users.firstName,
        [UserSortField.LAST_NAME]: users.lastName,
        [UserSortField.CREATED_AT]: users.createdAt,
    };


   private buildOrderBy(sortOptions?: UserRepositorySort[] | UserRepositorySort | null): SQL[] {
        if (!sortOptions) return [desc(users.createdAt)];

        const sorts = Array.isArray(sortOptions) ? sortOptions : [sortOptions];
        if (sorts.length === 0) return [desc(users.createdAt)];

        return sorts.map((sort) => {
            const direction = sort.order === SortOrder.ASC ? asc : desc;
            const column = this.sortColumnMap[sort.field];
            return column ? direction(column) : direction(users.id);
        });
    }

    private buildWhereConditions(
        filterOptions?: UserRepositoryFilter | null,
        isDeleted: boolean = false,
    ): SQL[] {
        const conditions: SQL[] = [];

        conditions.push(isDeleted ? isNotNull(users.deletedAt) : isNull(users.deletedAt));

        if (!filterOptions) return conditions;

        if (filterOptions.isActive !== undefined) {
            conditions.push(eq(users.isActive, filterOptions.isActive));
        }

        if (filterOptions.search) {
            const searchTerm = `%${filterOptions.search}%`;
            conditions.push(
                or(
                    ilike(users.email, searchTerm),
                    ilike(users.firstName, searchTerm),
                    ilike(users.lastName, searchTerm)
                )!
            );
        }

        if (filterOptions.createdFrom) {
            conditions.push(gte(users.createdAt, new Date(filterOptions.createdFrom)));
        }
        if (filterOptions.createdTo) {
            conditions.push(lte(users.createdAt, new Date(filterOptions.createdTo)));
        }
        
        if (filterOptions.updatedFrom) {
            conditions.push(gte(users.updatedAt, new Date(filterOptions.updatedFrom)));
        }
        if (filterOptions.updatedTo) {
            conditions.push(lte(users.updatedAt, new Date(filterOptions.updatedTo)));
        }

        return conditions;
    }

	async create(data: CreateUserDto): Promise<UserRow> {
		const persistenceModel = UserMapper.toPersistence(data);
		const [newEntity] = await this.drizzle
			.insert(users)
			.values(persistenceModel)
			.returning();

		return UserMapper.toDomain(newEntity);
	}

	async findManyWithPagination(criteria: FindManyUsersCriteria): Promise<User[]> {
        const conditions = this.buildWhereConditions(criteria.filterOptions);
        const limit = criteria.paginationOptions.limit;
        const offset = (criteria.paginationOptions.page - 1) * limit;

        const result = await this.drizzle
            .select()
            .from(users)
            .where(and(...conditions))
            .orderBy(...this.buildOrderBy(criteria.sortOptions))
            .limit(limit)
            .offset(offset);

        return result.map(UserMapper.toDomain);
    }

	async getDeletedUsers(criteria: FindManyUsersCriteria): Promise<User[]> {
        const conditions = this.buildWhereConditions(criteria.filterOptions, true);
        const limit = criteria.paginationOptions.limit;
        const offset = (criteria.paginationOptions.page - 1) * limit;

		const result = await this.drizzle
			.select()
			.from(users)
			.where(and(...conditions))
			.orderBy(...this.buildOrderBy(criteria.sortOptions))
			.limit(limit)
			.offset(offset);

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

		return UserMapper.toDomain(user);
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
		const updatedUsers = await this.drizzle
			.update(users)
			.set({
				isActive: dto.isActive,
				updatedAt: new Date(),
			})
			.where(inArray(users.id, dto.ids))
			.returning();

		return updatedUsers.map(UserMapper.toDomain);
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
        filterOptions?: UserRepositoryFilter | null,
        isDeleted: boolean = false,
    ): Promise<number> {
        const conditions = this.buildWhereConditions(filterOptions, isDeleted);

        const result = await this.drizzle
            .select({ value: count() })
            .from(users)
            .where(and(...conditions));

        return result[0]?.value ?? 0; // جلوگیری از کرش در صورت برگشت undefined
    }
}
