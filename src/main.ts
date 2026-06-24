import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import compression from "compression";
import validationOptions from "./utils/validation-options";
async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: true });

	app.enableShutdownHooks();
	app.useGlobalPipes(new ValidationPipe(validationOptions));
	app.use(helmet());
	app.use(compression());
	app.setGlobalPrefix("api");
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
