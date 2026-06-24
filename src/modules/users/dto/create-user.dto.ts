import {
	IsEmail,
	IsPhoneNumber,
	IsString,
	MinLength,
	IsNotEmpty,
	Matches,
	IsBoolean,
	IsOptional,
} from "class-validator";

export class CreateUserDto {
	@IsEmail()
	@IsNotEmpty()
	email!: string;

	@IsPhoneNumber("IR")
	@IsString()
	@IsNotEmpty()
	phoneNumber!: string;

	@IsString()
	@IsNotEmpty()
	firstName!: string;

	@IsString()
	@IsNotEmpty()
	lastName!: string;

	@IsBoolean()
	isActive!: boolean;

	@IsString()
	@MinLength(8)
	@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: "password too weak",
	})
	password!: string;
}
