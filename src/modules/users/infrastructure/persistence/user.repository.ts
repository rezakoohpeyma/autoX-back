import { DeepPartial } from "../../../../utils/types/deep-partial.type";
import { NullableType } from "../../../../utils/types/nullable.type";
import { PaginationOptions } from "../../../../utils/types/pagination-options";
import { User } from "../../domain/user";
import { UserRow } from "../../types/user";
import { UserSortField } from "../../enums/user.enums";
import { SortOrder } from "../../../../common/enums/sort-order";
import { ChangeUserStatusDto } from "../../dto/change-user-status-dto"; 

export interface UserRepositoryFilter {
    search?: string;
    isActive?: boolean;
    createdFrom?: string;
    createdTo?: string;
	updatedFrom?: string;
	updatedTo?: string;
}

export interface UserRepositorySort {
    field: UserSortField;
    order: SortOrder;
}
export interface FindManyUsersCriteria {
    filterOptions?: UserRepositoryFilter | null;
    sortOptions?: UserRepositorySort[] | UserRepositorySort | null;
    paginationOptions: { page: number; limit: number };
}

export interface ChangeUserStatusPayload {
    ids: number[];
    isActive: boolean;
}

export abstract class UserRepository {
    abstract create(
        data: Omit<UserRow, "id" | "createdAt" | "deletedAt" | "updatedAt">,
    ): Promise<User>;

    abstract findManyWithPagination(criteria: FindManyUsersCriteria): Promise<User[]>;

    abstract getDeletedUsers(criteria: FindManyUsersCriteria): Promise<User[]>;

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
        filterOptions?: UserRepositoryFilter | null,
        isDeleted?: boolean,
    ): Promise<number>;

    abstract remove(id: UserRow["id"]): Promise<void>;
}