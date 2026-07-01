import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Put,
	Query,
	UseInterceptors,
} from "@nestjs/common";
import type { NullableType } from "../../utils/types/nullable.type";
import type { User } from "./domain/user";
import type { ChangeUserStatusDto } from "./dto/change-user-status-dto";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { QueryUserDto } from "./dto/query-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";
import { PaginatedResponseDto } from "../../common/pagination/dto/paginated-response.dto";
import { UserResponseDto } from "./dto/user-response.dto";
@Controller("users")
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	create(@Body() createUserDto: CreateUserDto) : Promise<UserResponseDto> {
		return this.usersService.create(createUserDto);
	}

	@Get()
	async findAll(
		@Query() query: QueryUserDto,
	): Promise<PaginatedResponseDto<UserResponseDto>> {
		return this.usersService.findManyWithPagination(query);
	}

	@Get("deleted")
	async findDeletedUsers(@Query() query: QueryUserDto) {
		return this.usersService.getDeletedUsers(query);
	}

	@Patch(":id/restore")
	restoreUser(@Param("id") id: User["id"]) {
		return this.usersService.restoreUser(id);
	}

	@Get(":id")
	findOne(@Param("id") id: User["id"]): Promise<NullableType<UserResponseDto>> {
		return this.usersService.findById(id);
	}

	@Patch("status")
	changeStatus(@Body() dto: ChangeUserStatusDto) {
		return this.usersService.changeStatus(dto);
	}

	@Put(":id")
	update(
		@Param("id") id: User["id"],
		@Body() updateUserDto: UpdateUserDto,
	): Promise<UserResponseDto> {
		return this.usersService.update(id, updateUserDto);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Param("id") id: User["id"]): Promise<void> {
		return this.usersService.remove(id);
	}
}
