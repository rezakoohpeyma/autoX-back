import {
	HttpStatus,
	UnprocessableEntityException,
	type ValidationError,
	type ValidationPipeOptions,
} from "@nestjs/common";

function generateErrors(errors: ValidationError[]) {
	const result: Record<string, any> = {};
	for (const error of errors) {
		result[error.property] =
			(error.children?.length ?? 0) > 0
				? generateErrors(error.children!)
				: Object.values(error.constraints || {})[0];
	}
	return result;
}

const validationOptions: ValidationPipeOptions = {
	transform: true,
	whitelist: true,
	errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
	exceptionFactory: (errors: ValidationError[]) => {
		return new UnprocessableEntityException({
			status: HttpStatus.UNPROCESSABLE_ENTITY,
			errors: generateErrors(errors),
		});
	},
};

export default validationOptions;
