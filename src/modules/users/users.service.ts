import {
	BadRequestException,
	HttpStatus,
	Injectable,
	NotFoundException,
	UnprocessableEntityException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import bcrypt from "bcrypt";
import { UserMapper } from "./infrastructure/persistence/drizzle/mappers/user.mapper";
import { UserResponseDto } from "./dto/user-response.dto";
import { NullableType } from "../../utils/types/nullable.type";
import { UserRepository } from "./infrastructure/persistence/user.repository";
import { User } from "./domain/user";
import { ChangeUserStatusDto } from "./dto/change-user-status-dto";
import { FilterUserDto, QueryUserDto, SortUserDto } from "./dto/query-user.dto";
import { PaginatedResponseDto } from "../../common/pagination/dto/paginated-response.dto";
import { paginateResponse } from "../../utils/paginate.util";
@Injectable()
export class UsersService {
	constructor(private readonly usersRepository: UserRepository) {}

	async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
		const salt = await bcrypt.genSalt();
		const password = await bcrypt.hash(createUserDto.password, salt);

		const user = await this.usersRepository.create({
			...createUserDto,
			password,
		});
		return UserMapper.toResponse(user)!;
	}

	async findManyWithPagination(
		query: QueryUserDto,
	): Promise<PaginatedResponseDto<UserResponseDto>> {
		const { page = 1, limit = 10 } = query;
		const safeLimit = Math.min(limit, 50);
		const users = await this.usersRepository.findManyWithPagination({
			filterOptions: query.filters,
			sortOptions: query.sort,
			paginationOptions: { page, limit: safeLimit },
		});

		const total = await this.usersRepository.count(query.filters, false);

		return paginateResponse(
			users.map(UserMapper.toResponse) as UserResponseDto[],
			total,
			{ page, limit: safeLimit },
		);
	}
	async getDeletedUsers(
		query: QueryUserDto,
	): Promise<PaginatedResponseDto<UserResponseDto>> {
		const { page = 1, limit = 10 } = query;
		const safeLimit = Math.min(limit, 50);

		const users = await this.usersRepository.getDeletedUsers({
			filterOptions: query.filters,
			sortOptions: query.sort,
			paginationOptions: { page, limit: safeLimit },
		});

		const total = await this.usersRepository.count(query.filters, true);

		return paginateResponse(
			users.map(UserMapper.toResponse) as UserResponseDto[],
			total,
			{ page, limit: safeLimit },
		);
	}

	async restoreUser(id: User["id"]): Promise<UserResponseDto> {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new NotFoundException("User not found");
		}

		if (!user.deletedAt) {
			throw new BadRequestException("User is not deleted");
		}

		const restoredUser = await this.usersRepository.restore(id);

		return UserMapper.toResponse(restoredUser);
	}

	async findById(id: User["id"]): Promise<NullableType<UserResponseDto>> {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new NotFoundException("User not found");
		}
		return user ? UserMapper.toResponse(user) : null;
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

		return updatedUsers.map(UserMapper.toResponse);
	}

	async update(id: User["id"], dto: UpdateUserDto): Promise<UserResponseDto> {
		const user = await this.usersRepository.update(id, dto);

		if (!user) {
			throw new NotFoundException("User not found");
		}

		return UserMapper.toResponse(user);
	}

	async remove(id: User["id"]) {
		await this.usersRepository.remove(id);
	}
}
