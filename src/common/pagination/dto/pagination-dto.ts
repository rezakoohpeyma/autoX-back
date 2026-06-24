import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Max, Min } from "class-validator";

export class PaginationDto {
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	page: number = 1;

	@IsOptional()
	@IsPositive()
	@Min(5)
	@Max(100)
	@Type(() => Number)
	limit: number = 10;
}
