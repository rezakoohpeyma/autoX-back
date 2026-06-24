import {
	Body,
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
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { InfinityPaginationResponseDto } from "../../utils/dto/infinity-pagination-response.dto";
import { NullableType } from "../../utils/types/nullable.type";
import { User } from "./domain/user";
import { QueryUserDto } from "./dto/query-user.dto";
import { ApiParam } from "@nestjs/swagger";
import { ChangeUserStatusDto } from "./dto/change-user-status-dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
		return this.usersService.create(createUserDto);
	}

	@Get()
	@HttpCode(HttpStatus.OK)
	async findAll(
		@Query() query: QueryUserDto,
	): Promise<InfinityPaginationResponseDto<UserResponseDto>> {
		return this.usersService.findManyWithPagination(query);
	}

	@Get("deleted")
	@HttpCode(HttpStatus.OK)
	async findDeletedUsers(
		@Query() query: QueryUserDto,
	): Promise<InfinityPaginationResponseDto<UserResponseDto>> {
		return this.usersService.getDeletedUsers(query);
	}

	@Patch(":id/restore")
	@HttpCode(HttpStatus.OK)
	restoreUser(@Param("id") id: User["id"]) {
		return this.usersService.restoreUser(id);
	}

	@Get(":id")
	@HttpCode(HttpStatus.OK)
	@ApiParam({ name: "id", type: String, required: true })
	findOne(@Param("id") id: User["id"]): Promise<NullableType<UserResponseDto>> {
		return this.usersService.findById(id);
	}

	@Patch("status")
	changeStatus(@Body() dto: ChangeUserStatusDto) {
		return this.usersService.changeStatus(dto);
	}

	@Put(":id")
	@HttpCode(HttpStatus.OK)
	@ApiParam({
		name: "id",
		type: String,
		required: true,
	})
	update(
		@Param("id") id: User["id"],
		@Body() updateUserDto: UpdateUserDto,
	): Promise<UserResponseDto> {
		return this.usersService.update(id, updateUserDto);
	}

	@Delete(":id")
	@ApiParam({
		name: "id",
		type: String,
		required: true,
	})
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Param("id") id: User["id"]): Promise<void> {
		return this.usersService.remove(id);
	}
}
