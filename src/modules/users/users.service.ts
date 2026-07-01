import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { PaginatedResponseDto } from "../../common/pagination/dto/paginated-response.dto";
import { paginateResponse } from "../../utils/paginate.util";
import type { NullableType } from "../../utils/types/nullable.type";
import type { User } from "./domain/user";
import type { ChangeUserStatusDto } from "./dto/change-user-status-dto";
import type { CreateUserDto } from "./dto/create-user.dto";
import { type QueryUserDto } from "./dto/query-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import { UserMapper } from "./infrastructure/persistence/drizzle/mappers/user.mapper";
import { UserRepository } from "./infrastructure/persistence/user.repository";
import { UserRow } from "./types/user";
import { hashValue } from "../../utils/hash.util";
@Injectable()
export class UsersService {
	constructor(private readonly usersRepository: UserRepository) {}

	async create(createUserDto: CreateUserDto): Promise<UserRow> {
		const password = await hashValue(createUserDto.password);

		const user = await this.usersRepository.create({
			...createUserDto,
			password,
		});
		return user;
	}


	async findManyWithPagination(
		query: QueryUserDto,
	): Promise<PaginatedResponseDto<UserRow>> {
		const { page = 1, limit = 10 } = query;
		const safeLimit = Math.min(limit, 50);
		const users = await this.usersRepository.findManyWithPagination({
			filterOptions: query.filters,
			sortOptions: query.sort,
			paginationOptions: { page, limit: safeLimit },
		});

		const total = await this.usersRepository.count(query.filters, false);

	return paginateResponse(users, total, {
        page,
        limit: safeLimit,
    });
	}
	async getDeletedUsers(
		query: QueryUserDto,
	): Promise<PaginatedResponseDto<User>> {
		const { page = 1, limit = 10 } = query;
		const safeLimit = Math.min(limit, 50);

		const users = await this.usersRepository.getDeletedUsers({
			filterOptions: query.filters,
			sortOptions: query.sort,
			paginationOptions: { page, limit: safeLimit },
		});

		const total = await this.usersRepository.count(query.filters, true);

		return paginateResponse(users, total, {
        page,
        limit: safeLimit,
    });
	}

	async restoreUser(id: User["id"]): Promise<UserRow> {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new NotFoundException("User not found");
		}

		if (!user.deletedAt) {
			throw new BadRequestException("User is not deleted");
		}

		const restoredUser = await this.usersRepository.restore(id);

		return user;
	}

	async findById(id: User["id"]): Promise<NullableType<UserRow>> {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new NotFoundException("User not found");
		}
		return user;
	}
	async findByPhoneNumber(phoneNumber: string): Promise<NullableType<User>> {
		return this.usersRepository.findByPhoneNumber(phoneNumber);
	}

	async changeStatus(dto: ChangeUserStatusDto) {
		const users = await this.usersRepository.findByIds(dto.ids);
		if (users.length === 0) {
			throw new NotFoundException("Users not found");
		}

		if (users.length !== dto.ids.length) {
			throw new BadRequestException("Some user ids are invalid");
		}

		const updatedUsers = await this.usersRepository.changeStatus(dto);

		return users;
	}

	async update(id: User["id"], dto: UpdateUserDto): Promise<UserRow> {
		const user = await this.usersRepository.update(id, dto);

		if (!user) {
			throw new NotFoundException("User not found");
		}

		return user;
	}

	async remove(id: User["id"]) {
		await this.usersRepository.remove(id);
	}
}
