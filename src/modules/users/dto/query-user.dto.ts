import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { plainToInstance, Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsDateString,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator";
import { PaginationDto } from "../../../common/pagination/dto/pagination-dto";
import { UserSortField } from "../enums/user.enums";

export enum SortOrder {
	ASC = "asc",
	DESC = "desc",
}

export class FilterUserDto {
	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@IsOptional()
	@IsDateString()
	createdFrom?: string;

	@IsOptional()
	@IsDateString()
	createdTo?: string;

	@IsOptional()
	@IsDateString()
	updatedFrom?: string;

	@IsOptional()
	@IsDateString()
	updatedTo?: string;
}

export class SortUserDto {
	@IsEnum(UserSortField)
	orderBy!: UserSortField;

	@IsEnum(SortOrder)
	order!: SortOrder;
}

export class QueryUserDto extends PaginationDto {
	@ApiPropertyOptional({ type: String })
	@IsOptional()
	@Transform(({ value }) =>
		value ? plainToInstance(FilterUserDto, JSON.parse(value)) : undefined,
	)
	@ValidateNested()
	@Type(() => FilterUserDto)
	filters?: FilterUserDto | null;

	@ApiPropertyOptional({ type: String })
	@IsOptional()
	@Transform(({ value }) => {
		return value ? plainToInstance(SortUserDto, JSON.parse(value)) : undefined;
	})
	@ValidateNested({ each: true })
	@Type(() => SortUserDto)
	sort?: SortUserDto[] | null;
}
