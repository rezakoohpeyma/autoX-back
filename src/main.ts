import "dotenv/config";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import compression from "compression";
import helmet from "helmet";
import { AppModule } from "./app.module";
import validationOptions from "./utils/validation-options";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		cors: {
			origin: [process.env.CORS_ORIGINS!],
			credentials: true,
		},
	});

	app.enableShutdownHooks();
	app.useGlobalPipes(new ValidationPipe(validationOptions));
	app.use(helmet());
	app.use(compression());
	app.setGlobalPrefix("api");
	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

	const config = new DocumentBuilder()
		.setTitle("Auto-X API")
		.setDescription("The standard API documentation for Auto-X backend")
		.setVersion("1.0")
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api/docs", app, document);

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
