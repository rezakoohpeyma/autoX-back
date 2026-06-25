import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import { Response } from "express";
import { extractFieldAndValue } from "../../lib/db-error-field";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name);

	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message: string | string[] = "Internal server error";
		let errorType = "InternalServerError";

		const dbError = exception?.cause || exception;

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();
			message = (exceptionResponse as any).message || exception.message;
			errorType = exception.name;
		} else if (dbError?.code) {
			switch (dbError.code) {
				case "23505":
					status = HttpStatus.CONFLICT;
					errorType = "ConflictException";

					if (dbError.detail) {
						const extracted = extractFieldAndValue(dbError.detail);
						if (extracted) {
							message = `The value '${extracted.value}' for field '${extracted.field}' already exists.`;
						} else {
							message = "Duplicate entry detected.";
						}
					}
					break;

				case "23503":
					status = HttpStatus.BAD_REQUEST;
					errorType = "ForeignKeyViolation";
					message = "Related entity not found for this operation.";
					break;

				case "23514":
					status = HttpStatus.BAD_REQUEST;
					errorType = "CheckViolation";
					message = "The provided data violates database constraints.";
					break;

				default:
					this.logger.error(`Database Error Code: ${dbError.code}`, exception);
					break;
			}
		} else {
			this.logger.error("Unhandled Exception:", exception);
		}

		response.status(status).json({
			success: false,
			statusCode: status,
			error: errorType,
			message: message,
		});
	}
}
