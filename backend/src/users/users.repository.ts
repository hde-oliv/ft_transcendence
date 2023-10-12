import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Users as UserEntity } from '@prisma/client';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateOTPUserDto } from './dto/update-otp-user-dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserById(id: number): Promise<UserEntity | null> {
    return this.prismaService.users.findUnique({ where: { id: Number(id) } });
  }

  async getUserByIntra(intra_tag: string): Promise<UserEntity> {
    return this.prismaService.users.findUniqueOrThrow({
      where: { intra_login: intra_tag },
    });
  }

  async getAllUsers(): Promise<Array<UserEntity | null>> {
    return this.prismaService.users.findMany();
  }

  async createUser(user: CreateUserDto): Promise<UserEntity> {
    return this.prismaService.users.create({ data: user });
  }

  async updateOTP(user: UpdateOTPUserDto): Promise<UserEntity> {
    return this.prismaService.users.update({
      where: {
        intra_login: user.intra_login,
      },
      data: {
        otp_auth_url: user.otp_auth_url,
        otp_base32: user.otp_base32,
        otp_enabled: user.otp_enabled,
        otp_verified: user.otp_verified,
      },
    });
  }
}
