import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    Matches,
    MinLength,
} from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        example: "user@example.com",
        description: "User's email address",
    })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({
        example: "+989123456789",
        description: "Iranian phone number",
    })
    @IsPhoneNumber("IR")
    @IsString()
    @IsNotEmpty()
    phoneNumber!: string;

    @ApiProperty({ example: "Reza", description: "User's first name" })
    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @ApiProperty({ example: "Alavi", description: "User's last name" })
    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @ApiProperty({ example: true, description: "Whether the user is active or not" })
    @IsBoolean()
    isActive!: boolean;

    @ApiProperty({ 
        example: "StrongPass123!", 
        description: "User password (must contain uppercase, lowercase, numbers/symbols)" 
    })
    @IsString()
    @MinLength(8)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: "password too weak",
    })
    password!: string;
}