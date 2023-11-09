import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Channels,
  Memberships,
  Messages as MessageEntity,
} from '@prisma/client';
import { NewMessageDto } from './dto/new-message-dto';
import { CreateChannelDto } from './dto/create-channel-dto';
import { CreateMembershipDto } from './dto/create-membership-dto';
import { UpdateChannelDto } from './dto/update-channel-dto';
import { UpdateMembershipDto } from './dto/update-membership-dto';
import { TokenClaims } from 'src/auth/auth.model';

@Injectable()
export class ChatRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async createChannel(newChannel: CreateChannelDto): Promise<Channels> {
    return this.prismaService.channels.create({
      data: {
        type: newChannel.type,
        name: newChannel.name,
        password: newChannel.password,
        protected: newChannel.protected,
        user2user: newChannel.user2user,
      },
    });
  }

  async createMembership(
    newMembership: CreateMembershipDto,
  ): Promise<Memberships> {
    return this.prismaService.memberships.create({
      data: {
        ...newMembership,
      },
    });
  }

  async getUtUChannelByUsers(user1: string, user2: string): Promise<Channels> {
    const channelId_qr = await this.prismaService.memberships.groupBy({
      by: ['channelId'],
      having: {
        channelId: {
          _count: {
            equals: 2,
          },
        },
      },
      where: {
        user: {
          id: {
            in: [user1, user2],
          },
        },
        channel: {
          user2user: true,
        },
      },
    });
    if (channelId_qr.length > 0) {
      return this.prismaService.channels.findUniqueOrThrow({
        where: { id: channelId_qr[0].channelId },
      });
    }
    throw new NotFoundException(
      'NotFoundError: No channel exists for this users',
    );
  }

  async getChannel(id: number): Promise<Channels> {
    return this.prismaService.channels.findUniqueOrThrow({ where: { id } });
  }

  async getChannelsByUser(user: TokenClaims) {
    const userId = user.intra_login;
    return this.prismaService.memberships.findMany({
      where: {
        userId: userId
      },
      include: {
        channel: true
      },
      distinct: ['channelId']
    })
  }
  async getAllChannels(): Promise<Channels[]> {
    return this.prismaService.channels.findMany();
  }

  async updateChannel(
    id: number,
    updateChannel: UpdateChannelDto,
  ): Promise<Channels> {
    return this.prismaService.channels.update({
      where: { id },
      data: { ...updateChannel },
    });
  }

  async deleteChannel(id: number): Promise<Channels> {
    return this.prismaService.channels.delete({ where: { id } });
  }

  async deleteMembershipsbyChannel(channelId: number): Promise<any> {
    // TODO: type
    return this.prismaService.memberships.deleteMany({
      where: { channelId },
    });
  }

  async deleteMembership(
    userId: string,
    channelId: number,
  ): Promise<Memberships> {
    return this.prismaService.memberships.delete({
      where: { channelId_userId: { channelId, userId } },
    });
  }

  async updateMembership(
    userId: string,
    channelId: number,
    updateMembership: UpdateMembershipDto,
  ): Promise<Memberships> {
    return this.prismaService.memberships.update({
      where: { channelId_userId: { channelId, userId } },
      data: { ...updateMembership },
    });
  }

  async registerNewMessage(
    newMessage: NewMessageDto,
    user_id: string,
  ): Promise<MessageEntity> {
    return this.prismaService.messages.create({
      data: { user_id, ...newMessage },
    });
  }

  // NOTE: Return all including banned and kicked
  async getMembershipsbyChannel(
    channelId: number,
  ): Promise<Array<Memberships>> {
    return this.prismaService.memberships.findMany({
      where: { channelId },
      include: { user: true, channel: true },
    });
  }

  // NOTE: Return all including banned and kicked
  async getMembershipsbyUser(userId: string): Promise<Array<Memberships>> {
    return this.prismaService.memberships.findMany({
      where: { userId },
      include: { user: true, channel: true },
    });
  }

  async getChannelMessages(channelId: number): Promise<Array<MessageEntity>> {
    return this.prismaService.messages.findMany({
      where: { channel_id: Number(channelId) },
    });
  }

  async getChannelByName(name: string): Promise<Channels> {
    return this.prismaService.channels.findUniqueOrThrow({ where: { name } });
  }

  async getUsersByChannel(channelId: number) {
    return this.prismaService.users.findMany({
      where: {
        Memberships: {
          some: {
            channelId: channelId
          }
        }
      }
    })
  }
}
