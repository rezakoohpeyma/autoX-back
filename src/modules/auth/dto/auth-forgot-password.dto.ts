import { IsNotEmpty, IsString } from "class-validator";

export class AuthForgotPasswordDto {
	@IsNotEmpty()
	@IsString()
	phoneNumber!: string;
}
