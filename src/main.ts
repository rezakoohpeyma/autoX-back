import "dotenv/config"
import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import compression from "compression";
import validationOptions from "./utils/validation-options";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		cors: {
			origin: [process.env.CORS_ORIGINS!],
			credentials: true,
		},
	});

	app.enableShutdownHooks();
	app.useGlobalPipes(new ValidationPipe(validationOptions));
	app.useGlobalFilters(new GlobalExceptionFilter());
	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
	app.use(helmet());
	app.use(compression());
	app.setGlobalPrefix("api");
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
