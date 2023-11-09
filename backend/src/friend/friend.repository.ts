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
  constructor(private readonly prismaService: PrismaService) {}

  async createFriendship(
    new_friendship: CreateFriendshipDto,
  ): Promise<Friendships> {
    return this.prismaService.friendships.create({
      data: {
        ...new_friendship,
      },
    });
  }

  async getAllFriendships(): Promise<Friendships[]> {
    return this.prismaService.friendships.findMany();
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
