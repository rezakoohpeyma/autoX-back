import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsInt, IsUUID } from "class-validator";

export class ChangeUserStatusDto {
	@IsArray()
	@Type(() => Number)
	@IsInt({ each: true })
	ids!: number[];

	@IsBoolean()
	isActive!: boolean;
}
