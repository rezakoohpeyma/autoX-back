import { User } from "../../../../domain/user";
import { UserResponseDto } from "../../../../dto/user-response.dto";
import { UserRow } from "../../../../types/user";

export class UserMapper {
	static toDomain(raw: UserRow): User {
		return {
			id: raw.id,
			email: raw.email,
			firstName: raw.firstName,
			phoneNumber: raw.phoneNumber,
			password: raw.password,
			lastName: raw.lastName,
			isActive: raw.isActive,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
			deletedAt: raw.deletedAt,
		};
	}

	static toPersistence(
		domain: Omit<UserRow, "id" | "createdAt" | "updatedAt" | "deletedAt">,
	) {
		return {
			email: domain.email,
			password: domain.password,
			firstName: domain.firstName,
			phoneNumber: domain.phoneNumber,
			lastName: domain.lastName,
			isActive: domain.isActive ?? true,
		};
	}

	static toResponse(user: User): UserResponseDto {
		return {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			phoneNumber: user.phoneNumber,
			lastName: user.lastName,
			isActive: user.isActive ?? true,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			deletedAt: user.deletedAt,
		};
	}
}
