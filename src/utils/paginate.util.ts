// src/utils/paginate.util.ts
import { PaginatedResponseDto } from "../common/pagination/dto/paginated-response.dto";
import { PaginationOptions } from "./types/pagination-options";

export function paginateResponse<T>(
	data: T[],
	totalItems: number,
	options: PaginationOptions,
): PaginatedResponseDto<T> {
	const { page, limit } = options;
	const totalPages = Math.ceil(totalItems / limit);

	return {
		data,
		meta: {
			page,
			limit,
			totalItems,
			totalPages,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
		},
	};
}
