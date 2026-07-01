import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class AuthResetPasswordDto {
	@IsNotEmpty()
	@IsString()
	phoneNumber!: string;

	@IsNotEmpty()
	@IsString()
	otpCode!: string; // The code sent via SMS

	@IsNotEmpty()
	@MinLength(6)
	password!: string; // The new password
}
