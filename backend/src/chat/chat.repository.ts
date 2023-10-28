import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Messages as MessageEntity } from '@prisma/client';
import { NewMessageDto } from './dto/new-message-dto';

@Injectable()
export class ChatRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async registerNewMessage(
    newMessage: NewMessageDto,
    user_id: number,
  ): Promise<MessageEntity> {
    return this.prismaService.messages.create({
      data: { user_id, ...newMessage },
    });
  }

  // async getUserById(id: number): Promise<UserEntity | null> {
  //   return this.prismaService.users.findUnique({ where: { id: Number(id) } });
  // }

  // async getUserByIntra(intra_tag: string): Promise<UserEntity> {
  //   return this.prismaService.users.findUniqueOrThrow({
  //     where: { intra_login: intra_tag },
  //   });
  // }

  // async getAllUsers(): Promise<Array<UserEntity | null>> {
  //   return this.prismaService.users.findMany();
  // }

  // async createUser(user: CreateUserDto): Promise<UserEntity> {
  //   return this.prismaService.users.create({ data: user });
  // }

  // async updateUser(user: UpdateUserDto): Promise<UserEntity> {
  //   return this.prismaService.users.update({
  //     where: {
  //       intra_login: user.intra_login,
  //     },
  //     data: {
  //       nickname: user.nickname,
  //       avatar: user.avatar,
  //     },
  //   });
  // }

  // async updateOTP(user: UpdateOTPUserDto): Promise<UserEntity> {
  //   return this.prismaService.users.update({
  //     where: {
  //       intra_login: user.intra_login,
  //     },
  //     data: {
  //       otp_auth_url: user.otp_auth_url,
  //       otp_base32: user.otp_base32,
  //       otp_enabled: user.otp_enabled,
  //       otp_verified: user.otp_verified,
  //     },
  //   });
  // }
}
