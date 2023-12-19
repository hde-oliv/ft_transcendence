import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Invites } from '@prisma/client';
import { CreateInviteDto } from './dto/create-invite-dto';
import { throws } from 'assert';


@Injectable()
export class MatchRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async createInvite(newInviteForIntra: CreateInviteDto): Promise<Invites> {
    const targetUser = await this.prismaService.users.findUnique({
      where: { id: newInviteForIntra.target_id },
    });
  
    if (!targetUser) {
      throw new NotFoundException(`User with id ${newInviteForIntra.target_id} not found`);
    }

    let existingInvite: Invites | null;

    try {
      existingInvite = await this.prismaService.invites.findFirst({
        where: {
          user_id: newInviteForIntra.user_id,
          target_id: newInviteForIntra.target_id,
        },
      });
    } catch (error) {
      existingInvite = null;
    }

    if (existingInvite) {
      return {
        id: existingInvite.id,
        user_id: existingInvite.user_id,
        target_id: existingInvite.target_id,
        fulfilled: existingInvite.fulfilled,
      };
    } else {
      try {
        return await this.prismaService.invites.create({
          data: {
            user_id: newInviteForIntra.user_id,
            target_id: newInviteForIntra.target_id,
          },
        });
      } catch (error) {

      }
    }
    throw new NotFoundException(`User with id ${newInviteForIntra.target_id} not found`);
  }
}