import { IPaginationOptions } from "./types/pagination-options";
import { InfinityPaginationResponseDto } from "./dto/infinity-pagination-response.dto";

export const infinityPagination = <T>(
	data: T[],
	total: number,
	options: IPaginationOptions,
): InfinityPaginationResponseDto<T> => {
	const totalPages = Math.ceil(total / options.limit);
	return {
		data,
		page: options.page,
		limit: options.limit,
		total,
		totalPages,
		hasNext: options.page < totalPages,
		hasPrevious: options.page > 1,
	};
};
