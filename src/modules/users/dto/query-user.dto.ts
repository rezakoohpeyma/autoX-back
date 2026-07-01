import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
} from "class-validator";
import { PaginationDto } from "../../../common/pagination/dto/pagination-dto";
import { UserSortField } from "../enums/user.enums";
import { SortOrder } from "../../../common/enums/sort-order";

export class QueryUserDto extends PaginationDto {
    @ApiPropertyOptional({
        description: "Search query to filter users by name, email, phone number, etc.",
        example: "John Doe",
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: "Filter users by their active status",
        example: true,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === "true" || value === true) return true;
        if (value === "false" || value === false) return false;
        return value;
    })
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: "Filter users created from this date (ISO 8601 format)",
        example: "2024-01-01T00:00:00Z",
    })
    @IsOptional()
    @IsDateString({ strict: true })
    createdFrom?: string;

    @ApiPropertyOptional({
        description: "Filter users created up to this date (ISO 8601 format)",
        example: "2024-12-31T23:59:59Z",
    })
    @IsOptional()
    @IsDateString({ strict: true })
    createdTo?: string;

    @ApiPropertyOptional({
        description: "Filter users updated from this date (ISO 8601 format)",
        example: "2024-01-01T00:00:00Z",
    })
    @IsOptional()
    @IsDateString({ strict: true })
    updatedFrom?: string;

    @ApiPropertyOptional({
        description: "Filter users updated up to this date (ISO 8601 format)",
        example: "2024-12-31T23:59:59Z",
    })
    @IsOptional()
    @IsDateString({ strict: true })
    updatedTo?: string;

    @ApiPropertyOptional({
        enum: UserSortField,
        description: "The field by which the results should be sorted",
        example: UserSortField.CREATED_AT,
    })
    @IsOptional()
    @IsEnum(UserSortField)
    sortBy?: UserSortField;

    @ApiPropertyOptional({
        enum: SortOrder,
        description: "The sorting order (ascending or descending)",
        default: SortOrder.DESC,
        example: SortOrder.DESC,
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;
}