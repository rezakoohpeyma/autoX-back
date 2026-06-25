import { ApiProperty } from "@nestjs/swagger";

export class PaginationMetaDto {
	@ApiProperty({ example: 1, description: "Current page number" })
	page!: number;

	@ApiProperty({ example: 10, description: "Number of records per page" })
	limit!: number;

	@ApiProperty({ example: 150, description: "Total number of items" })
	totalItems!: number;

	@ApiProperty({ example: 15, description: "Total number of pages" })
	totalPages!: number;

	@ApiProperty({
		example: true,
		description: "Indicates if there is a next page",
	})
	hasNextPage!: boolean;

	@ApiProperty({
		example: false,
		description: "Indicates if there is a previous page",
	})
	hasPreviousPage!: boolean;
}

export class PaginatedResponseDto<T> {
	@ApiProperty({ isArray: true })
	data!: T[];

	@ApiProperty({ type: PaginationMetaDto })
	meta!: PaginationMetaDto;
}
