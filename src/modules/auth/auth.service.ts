import { 
  Injectable, 
  UnauthorizedException 
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByPhoneNumber(loginDto.phoneNumber);

    if (!user) {
      throw new UnauthorizedException("Invalid phone number or password");
    }
    
    if (!user.isActive) {
      throw new UnauthorizedException("User account is disabled. Please contact support.");
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid phone number or password");
    }

    const payload = { 
      sub: user.id, 
      phoneNumber: user.phoneNumber 
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // 1. Create the user. 
    // Any DB constraint violations (like duplicate email/phone) will throw an error 
    // and be intercepted by your Global Exception Filter.
    const user = await this.usersService.create(registerDto);

    // 2. Generate JWT Token
    const payload = { 
      sub: user.id, 
      phoneNumber: user.phoneNumber 
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // 3. Return response
    return {
      accessToken,
      user,
    };
  }
}