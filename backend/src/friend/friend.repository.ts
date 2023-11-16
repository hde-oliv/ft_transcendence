import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Channels,
  Memberships,
  Friendships,
  Messages as MessageEntity,
} from '@prisma/client';
import { CreateFriendshipDto } from './dto/create-friendship-dto';

@Injectable()
export class FriendRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async createFriendship(
    new_friendship: CreateFriendshipDto,
  ): Promise<Friendships> {
    return this.prismaService.friendships.create({
      data: {
        ...new_friendship,
      },
    });
  }

  async getAllFriendships(userId: string) {
    return this.prismaService.friendships.findMany({
      where: {
        OR: [
          { fOne: userId },
          { fTwo: userId },
        ]
      },
      select: {
        friend_one: {
          select: {
            nickname: true,
            avatar: true,
            intra_login: true,
            status: true,
            elo: true,
          }
        },
        friend_two: {
          select: {
            nickname: true,
            avatar: true,
            intra_login: true,
            status: true,
            elo: true,
          }
        }
      }
    });
  }

  async getFriendshipById(id: string): Promise<Friendships> {
    return await this.prismaService.friendships.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
  }

  async getFriendshipsByUser(id: string): Promise<Friendships[]> {
    return await this.prismaService.friendships.findMany({
      where: {
        OR: [{ fOne: id }, { fTwo: id }],
      },
    });
  }
}
