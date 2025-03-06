import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginDto, AuthTokenResponse, User } from '@phishing-simulator/shared-types';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<AuthTokenResponse> {
    const { email, password, role } = createUserDto;

    const isExistingUser = await this.userModel.findOne({ email });
    if (isExistingUser) {
      throw new ConflictException('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      role: role || 'USER',
    });

    await newUser.save();

    return this.generateAuthToken(newUser);
  }

  async login(loginDto: LoginDto): Promise<AuthTokenResponse> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthToken(user);
  }

  private generateAuthToken(user: User): AuthTokenResponse {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async validateUser(payload: { sub: string }): Promise<User | null> {
    return this.userModel.findById(payload.sub).select('-password');
  }
}
