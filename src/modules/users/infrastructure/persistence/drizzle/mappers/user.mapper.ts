import { User } from "../../../../domain/user";
import type { UserResponseDto } from "../../../../dto/user-response.dto";
import type { UserRow } from "../../../../types/user";

export class UserMapper {
	static toDomain(raw: UserRow): User {
		const user = new User();

		user.id = raw.id;
		user.email = raw.email;
		user.firstName = raw.firstName;
		user.phoneNumber = raw.phoneNumber;
		user.password = raw.password;
		user.lastName = raw.lastName;
		user.isActive = raw.isActive;
		user.createdAt = raw.createdAt;
		user.updatedAt = raw.updatedAt;
		user.deletedAt = raw.deletedAt;

		return user;
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
}
