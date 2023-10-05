import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User as UserEntity } from '@prisma/client';
import { User as UserModel, createRandomUser } from './user.model';
import { UserController } from './user.controller';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async getUserById(id: number): Promise<UserEntity | null> {
    return this.prismaService.users.findUnique({ where: { id: Number(id) } });
  }

  async getUserByIntra(intra_tag: string): Promise<UserEntity | null> {
    return this.prismaService.users.findUnique({ where: { intra_login: intra_tag } })
  }

  async getAllUsers(): Promise<Array<UserEntity | null>> {
    return this.prismaService.users.findMany();
  }

  async createRandomUser(): Promise<UserEntity> {
    const randomUser = createRandomUser();

    return this.prismaService.users.create({ data: randomUser });
  }

  async createUser(user: UserModel): Promise<UserEntity> {
    return this.prismaService.users.create({ data: user });
  }
}
