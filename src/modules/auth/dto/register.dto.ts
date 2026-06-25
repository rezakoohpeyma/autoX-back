import { PickType } from "@nestjs/mapped-types"; 
import { CreateUserDto } from "../../users/dto/create-user.dto";

export class RegisterDto extends PickType(CreateUserDto, [
  "phoneNumber",
  "password",
  "firstName",
  "lastName",
  "isActive", 
  "email"
] as const) {}