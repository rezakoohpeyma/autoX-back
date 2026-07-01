import { type ArgumentsHost, Catch, HttpStatus, Logger } from "@nestjs/common";
import { BaseExceptionFilter, HttpAdapterHost } from "@nestjs/core";
import { extractFieldAndValue } from "../../lib/db-error-field";

// Interface tailored to match pg/postgres driver error structure
interface PostgresError extends Error {
	code?: string;
	detail?: string;
	table?: string;
	column?: string;
	constraint?: string;
	cause?: PostgresError;
}

@Catch()
export class DatabaseExceptionFilter extends BaseExceptionFilter {
	private readonly logger = new Logger(DatabaseExceptionFilter.name);

	constructor(private readonly adapterHost: HttpAdapterHost) {
		super(adapterHost.httpAdapter);
	}

	catch(exception: unknown, host: ArgumentsHost): void {
		// 1. Intercept and handle database specific errors natively
		if (this.isPostgresError(exception)) {
			this.handleDatabaseError(exception, host);
			return;
		}

		// 2. Delegate all non-database exceptions to NestJS default handler (e.g. HttpExceptions)
		super.catch(exception, host);
	}

	private handleDatabaseError(
		exception: PostgresError,
		host: ArgumentsHost,
	): void {
		const { httpAdapter } = this.adapterHost;
		const ctx = host.switchToHttp();

		const dbErrorInfo = this.mapDatabaseError(exception);

		const responseBody = {
			success: false,
			statusCode: dbErrorInfo.status,
			error: dbErrorInfo.errorType,
			message: dbErrorInfo.message,
			timestamp: new Date().toISOString(),
			path: httpAdapter.getRequestUrl(ctx.getRequest()),
		};

		httpAdapter.reply(ctx.getResponse(), responseBody, dbErrorInfo.status);
	}

	/**
	 * Type Guard: Validates if the exception originates from PostgreSQL.
	 * Postgres error codes (SQLSTATE) are strictly 5-character strings.
	 */
	private isPostgresError(exception: any): exception is PostgresError {
		const code = exception?.code || exception?.cause?.code;
		return typeof code === "string" && code.length === 5;
	}

	/**
	 * Maps Postgres SQLSTATE codes to standardized HTTP responses.
	 */
	private mapDatabaseError(error: PostgresError): {
		status: HttpStatus;
		errorType: string;
		message: string;
	} {
		const errorCode = error.code || error.cause?.code;
		const errorDetail = error.detail || error.cause?.detail;

		switch (errorCode) {
			case "23505": {
				// Unique violation
				let msg = "Duplicate entry detected.";
				if (errorDetail) {
					const extracted = extractFieldAndValue(errorDetail);
					if (extracted) {
						msg = `The value '${extracted.value}' for field '${extracted.field}' already exists.`;
					}
				}
				return {
					status: HttpStatus.CONFLICT,
					errorType: "ConflictException",
					message: msg,
				};
			}

			case "23503": // Foreign key violation
				return {
					status: HttpStatus.BAD_REQUEST,
					errorType: "ForeignKeyViolation",
					message: "Related entity not found for this operation.",
				};

			case "23514": // Check constraint violation
				return {
					status: HttpStatus.BAD_REQUEST,
					errorType: "CheckViolation",
					message: "The provided data violates database constraints.",
				};

			case "23502": // Not null violation
				return {
					status: HttpStatus.BAD_REQUEST,
					errorType: "NotNullViolation",
					message: `Missing required field: '${error.column || "unknown"}'.`,
				};

			case "22P02": // Invalid text representation (e.g. malformed UUID or integer)
				return {
					status: HttpStatus.BAD_REQUEST,
					errorType: "InvalidDataFormat",
					message:
						"Invalid data format provided (e.g., malformed UUID or Number).",
				};

			default:
				// Log unhandled database errors for internal debugging without exposing sensitive details to the client
				this.logger.error(
					`Unhandled Postgres Error Code: ${errorCode}`,
					error.stack || "",
				);
				return {
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					errorType: "InternalServerError",
					message: "A database error occurred.",
				};
		}
	}
}
