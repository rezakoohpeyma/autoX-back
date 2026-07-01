import {
	IsEmail,
	IsNotEmpty,
	IsPhoneNumber,
	IsString,
	isPhoneNumber,
	MinLength,
} from "class-validator";

export class LoginDto {
	@IsPhoneNumber("IR")
	@IsNotEmpty()
	@IsString()
	phoneNumber!: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(8, { message: "Password must be at least 6 characters long" })
	password!: string;
}
