import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Invites } from '@prisma/client';
import { CreateInviteDto } from './dto/create-invite-dto';


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
  

    try {
      return this.prismaService.invites.create({
        data: {
          user_id: newInviteForIntra.user_id,
          target_id: newInviteForIntra.target_id,
        },
      }); 
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const {user_id, target_id} = newInviteForIntra;
          return this.prismaService.invites.findUniqueOrThrow({

            where: {
              user_id_target_id:{user_id, target_id} 
            }
          });
        }
      }
    }
    throw new NotFoundException(`User with id ${newInviteForIntra.target_id} not found`);
  }
}