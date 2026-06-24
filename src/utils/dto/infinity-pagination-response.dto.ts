import { Type } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

export class InfinityPaginationResponseDto<T> {
	data: T[];

	page: number;
	limit: number;

	total: number;
	totalPages: number;

	hasNext: boolean;
	hasPrevious: boolean;
}

export function PaginationResponse<T>(classReference: Type<T>) {
	abstract class Pagination {
		@ApiProperty({ type: [classReference] })
		data!: T[];

		@ApiProperty()
		page!: number;

		@ApiProperty()
		limit!: number;

		@ApiProperty()
		total!: number;

		@ApiProperty()
		totalPages!: number;

		@ApiProperty()
		hasNext!: boolean;

		@ApiProperty()
		hasPrevious!: boolean;
	}

	Object.defineProperty(Pagination, "name", {
		value: `Pagination${classReference.name}ResponseDto`,
	});

	return Pagination;
}
