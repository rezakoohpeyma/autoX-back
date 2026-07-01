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
import { ChangeUserStatusDto } from "./dto/change-user-status-dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { QueryUserDto } from "./dto/query-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";
import { PaginatedResponseDto } from "../../common/pagination/dto/paginated-response.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiOperation({ summary: "Create a new user" })
	@ApiResponse({
		status: 201,
		description: "User successfully created.",
		type: UserResponseDto,
	})
	@ApiResponse({ status: 400, description: "Bad Request. Invalid input data." })
	@ApiResponse({
		status: 403,
		description: "Forbidden. Insufficient permissions.",
	})
	@ApiResponse({ status: 422, description: "Validation Error." })
	@Post()
	@HttpCode(HttpStatus.CREATED)
	create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
		return this.usersService.create(createUserDto);
	}

	@ApiOperation({ summary: "Get paginated list of users" })
	@ApiResponse({
		status: 200,
		description: "List of users returned successfully.",
	})
	@Get()
	async findAll(
		@Query() query: QueryUserDto,
	): Promise<PaginatedResponseDto<UserResponseDto>> {
		return this.usersService.findManyWithPagination(query);
	}

	@ApiOperation({
		summary: "Get paginated list of deleted (soft-deleted) users",
	})
	@ApiResponse({
		status: 200,
		description: "List of deleted users returned successfully.",
	})
	@Get("deleted")
	async findDeletedUsers(@Query() query: QueryUserDto) {
		return this.usersService.getDeletedUsers(query);
	}

	@ApiOperation({ summary: "Restore a soft-deleted user by ID" })
	@ApiParam({
		name: "id",
		type: "string",
		description: "The unique ID of the user to restore",
	})
	@ApiResponse({ status: 200, description: "User successfully restored." })
	@ApiResponse({ status: 404, description: "User not found or not deleted." })
	@Patch(":id/restore")
	restoreUser(@Param("id") id: User["id"]) {
		return this.usersService.restoreUser(id);
	}

	@ApiOperation({ summary: "Get a specific user by ID" })
	@ApiParam({
		name: "id",
		type: "string",
		description: "The unique ID of the user",
	})
	@ApiResponse({
		status: 200,
		description: "User found successfully.",
		type: UserResponseDto,
	})
	@ApiResponse({ status: 404, description: "User not found." })
	@Get(":id")
	findOne(@Param("id") id: User["id"]): Promise<NullableType<UserResponseDto>> {
		return this.usersService.findById(id);
	}

	@ApiOperation({
		summary: "Change status of multiple users (e.g., Active/Inactive)",
	})
	@ApiResponse({
		status: 200,
		description: "Users status updated successfully.",
	})
	@ApiResponse({
		status: 400,
		description: "Bad Request. Invalid status data.",
	})
	@Patch("status")
	changeStatus(@Body() dto: ChangeUserStatusDto) {
		return this.usersService.changeStatus(dto);
	}

	@ApiOperation({ summary: "Update a user by ID" })
	@ApiParam({
		name: "id",
		type: "string",
		description: "The unique ID of the user to update",
	})
	@ApiResponse({
		status: 200,
		description: "User successfully updated.",
		type: UserResponseDto,
	})
	@ApiResponse({ status: 400, description: "Bad Request. Invalid input data." })
	@ApiResponse({ status: 404, description: "User not found." })
	@Put(":id")
	update(
		@Param("id") id: User["id"],
		@Body() updateUserDto: UpdateUserDto,
	): Promise<UserResponseDto> {
		return this.usersService.update(id, updateUserDto);
	}

	@ApiOperation({ summary: "Soft delete a user by ID" })
	@ApiParam({
		name: "id",
		type: "string",
		description: "The unique ID of the user to delete",
	})
	@ApiResponse({ status: 204, description: "User successfully deleted." })
	@ApiResponse({ status: 404, description: "User not found." })
	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Param("id") id: User["id"]): Promise<void> {
		return this.usersService.remove(id);
	}
}
