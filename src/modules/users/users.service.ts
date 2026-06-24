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
import { IPaginationOptions } from "../../utils/types/pagination-options";
import { NullableType } from "../../utils/types/nullable.type";
import { UserRepository } from "./infrastructure/persistence/user.repository";
import { User } from "./domain/user";
import { ChangeUserStatusDto } from "./dto/change-user-status-dto";
import { FilterUserDto, QueryUserDto, SortUserDto } from "./dto/query-user.dto";
import { InfinityPaginationResponseDto } from "../../utils/dto/infinity-pagination-response.dto";
import { infinityPagination } from "../../utils/infinity-pagination";
@Injectable()
export class UsersService {
	findByIds(ids: string): Promise<UserResponseDto[]> {
		throw new Error("Method not implemented.");
	}
	constructor(private readonly usersRepository: UserRepository) {}

	async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
		if (!createUserDto.password) {
			throw new UnprocessableEntityException({
				status: HttpStatus.UNPROCESSABLE_ENTITY,
				errors: {
					password: "passwordRequired",
				},
			});
		}

		const salt = await bcrypt.genSalt();
		const password = await bcrypt.hash(createUserDto.password, salt);

		let phoneNumber: string | undefined = undefined;

		if (createUserDto.phoneNumber) {
			phoneNumber = createUserDto.phoneNumber;
		} else {
			throw new UnprocessableEntityException({
				status: HttpStatus.UNPROCESSABLE_ENTITY,
				errors: {
					phoneNumber: "phoneNumberRequired",
				},
			});
		}

		const user = await this.usersRepository.create({
			firstName: createUserDto.firstName,
			lastName: createUserDto.lastName,
			email: createUserDto.email,
			phoneNumber,
			password,
			isActive: createUserDto.isActive,
		});
		return UserMapper.toResponse(user)!;
	}

	async findManyWithPagination(
		query: QueryUserDto,
	): Promise<InfinityPaginationResponseDto<UserResponseDto>> {
		const page = query.page ?? 1;
		let limit = query.limit ?? 10;

		if (limit > 50) limit = 50;

		const users = await this.usersRepository.findManyWithPagination({
			filterOptions: query.filters,
			sortOptions: query.sort,
			paginationOptions: {
				page,
				limit,
			},
		});

		const total = await this.usersRepository.count(query.filters);
		return infinityPagination(users.map(UserMapper.toResponse), total, {
			page,
			limit,
		});
	}

	async getDeletedUsers(
		query: QueryUserDto,
	): Promise<InfinityPaginationResponseDto<UserResponseDto>> {
		const page = query.page ?? 1;
		let limit = query.limit ?? 10;

		if (limit > 50) limit = 50;

		const users = await this.usersRepository.getDeletedUsers({
			filterOptions: query.filters,
			sortOptions: query.sort,
			paginationOptions: {
				page,
				limit,
			},
		});
          
		const total = await this.usersRepository.count(query.filters);

		return infinityPagination(users.map(UserMapper.toResponse), total, {
			page,
			limit,
		});
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
