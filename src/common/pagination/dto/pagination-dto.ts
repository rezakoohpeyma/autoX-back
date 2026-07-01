import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Max, Min } from "class-validator";

export class PaginationDto {
    @ApiPropertyOptional({
        description: "Page number for pagination",
        default: 1,
        example: 1,
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    page: number = 1;

    @ApiPropertyOptional({
        description: "Number of items per page",
        default: 10,
        example: 10,
    })
    @IsOptional()
    @IsPositive()
    @Min(5)
    @Max(100)
    @Type(() => Number)
    limit: number = 10;
}