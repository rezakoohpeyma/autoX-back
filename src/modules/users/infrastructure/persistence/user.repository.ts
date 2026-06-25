import { DeepPartial } from "../../../../utils/types/deep-partial.type";
import { NullableType } from "../../../../utils/types/nullable.type";
import { PaginationOptions } from "../../../../utils/types/pagination-options";
import { User } from "../../domain/user";
import { ChangeUserStatusDto } from "../../dto/change-user-status-dto";
import { FilterUserDto } from "../../dto/query-user.dto";
import { UserRow } from "../../types/user";
export abstract class UserRepository {
	abstract create(
		data: Omit<UserRow, "id" | "createdAt" | "deletedAt" | "updatedAt">,
	): Promise<User>;

	abstract findManyWithPagination({
		filterOptions,
		sortOptions,
		paginationOptions,
	}: {
		filterOptions?: FilterUserDto | null;
		sortOptions?: unknown[] | null;
		paginationOptions: PaginationOptions;
	}): Promise<User[]>;

	abstract getDeletedUsers({
		filterOptions,
		sortOptions,
		paginationOptions,
	}: {
		filterOptions?: FilterUserDto | null;
		sortOptions?: unknown[] | null;
		paginationOptions: PaginationOptions;
	}): Promise<User[]>;
	abstract restore(id: UserRow["id"]): Promise<User>;
	abstract findById(id: UserRow["id"]): Promise<NullableType<User>>;
	abstract findByIds(ids: UserRow["id"][]): Promise<UserRow[]>;
	abstract findByPhoneNumber(phoneNumber: string): Promise<NullableType<User>>;
	abstract changeStatus(data: ChangeUserStatusDto): Promise<User[]>;
	abstract update(
		id: UserRow["id"],
		payload: DeepPartial<UserRow>,
	): Promise<UserRow | null>;
	abstract count(
		filterOptions?: FilterUserDto | null,
		isDeleted?: boolean,
	): Promise<number>;

	abstract remove(id: UserRow["id"]): Promise<void>;
}
