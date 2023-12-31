import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Users as UserEntity } from '@prisma/client';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateOTPUserDto } from './dto/update-otp-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async getUserById(id: string): Promise<UserEntity | null> {
    return this.prismaService.users.findUnique({ where: { id: id } });
  }

  async getUserByIntra(intra_tag: string): Promise<UserEntity> {
    return this.prismaService.users.findUniqueOrThrow({
      where: { intra_login: intra_tag },
    });
  }

  async getAllUsers(): Promise<Array<UserEntity>> {
    return this.prismaService.users.findMany();
  }

  async createUser(user: CreateUserDto): Promise<UserEntity> {
    return this.prismaService.users.create({ data: user });
  }

  async updateUser(user: UpdateUserDto): Promise<UserEntity> {
    return this.prismaService.users.update({
      where: {
        intra_login: user.intra_login,
      },
      data: {
        nickname: user.nickname,
        avatar: user.avatar,
      },
    });
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

  async updateUserOnline(userId: string, online: boolean) {
    const status = online ? 'online' : 'offline';
    return this.prismaService.users.update({
      where: {
        id: userId
      },
      data: {
        online: online,
        status: status
      }
    })
  }
  async getBlockedUsers(issuerId: string) {
    return this.prismaService.users.findMany({
      select: {
        id: true,
        nickname: true,
        avatar: true,
        intra_login: true,
        status: true,
        elo: true,
        online: true,
        blockedTarget: {
          where: {
            issuer_id: issuerId
          }
        }
      }
    })
  }
  async getWhoBlocks(targetId: string) {
    return this.prismaService.users.findMany({
      select: {
        id: true,
        nickname: true,
        avatar: true,
        intra_login: true,
        status: true,
        elo: true,
        online: true,
        blockedIssuer: {
          where: {
            target_id: targetId
          }
        }
      }
    })
  }
}
