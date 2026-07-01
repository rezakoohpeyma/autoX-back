export type JwtPayloadType = {
	sub: string | number;
	sessionId: number;
	phoneNumber: string;

	iat?: number;

	exp?: number;
};
