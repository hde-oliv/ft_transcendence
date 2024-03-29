import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Invites } from '@prisma/client';
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

    if (existingInvite !== null) {
      return {
        id: existingInvite.id,
        user_id: existingInvite.user_id,
        target_id: existingInvite.target_id,
        fulfilled: existingInvite.fulfilled,
      };
    }
    try {
      return await this.prismaService.invites.create({
        data: {
          user_id: newInviteForIntra.user_id,
          target_id: newInviteForIntra.target_id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(`Server wasn't able to create invite in the database`);
    }
  }

  async deleteInvite(id: string) {
    return this.prismaService.invites.delete({
      where: {
        id: id
      }
    })
  }

  async getInviteById(inviteId: string) {
    return this.prismaService.invites.findUniqueOrThrow({
      where: {
        id: inviteId
      }
    })
  }

  async createMatch(pOneId: string, ptwoId: string) {
    return this.prismaService.matches.create({
      data: {
        p_one: pOneId,
        p_two: ptwoId,
        p_one_score: 0,
        p_two_score: 0
      }
    })
  }
  async getMatchById(matchId: string) {
    return this.prismaService.matches.findUniqueOrThrow({
      where: {
        id: matchId
      }
    });
  }
  async incrementScoreById(matchId: string, player_tag: string) {
    const matchData = await this.prismaService.matches.findUniqueOrThrow({
      where: {
        id: matchId,
        OR: [
          {
            p_one: player_tag
          },
          {
            p_two: player_tag
          }
        ]
      }
    });
    if (matchData.p_one === player_tag)
      return this.prismaService.matches.update({
        where: {
          id: matchId,
          p_one: player_tag
        },
        data: {
          p_one_score: {
            increment: 1
          }
        }
      })
    else
      return this.prismaService.matches.update({
        where: {
          id: matchId,
          p_two: player_tag
        },
        data: {
          p_two_score: {
            increment: 1
          }
        }
      })
  }
  async getMatchesByUser(intra_tag: string) {
    return this.prismaService.matches.findMany({
      select: {
        id: true,
        p_one_score: true,
        p_two_score: true,
        start: true,
        end: true,
        status: true,
        player_one: {
          select: {
            id: true, nickname: true
          }
        },
        player_two: {
          select: {
            id: true, nickname: true
          }
        }
      },
      where: {
        OR: [
          {
            p_one: intra_tag
          },
          {
            p_two: intra_tag
          }
        ],
        NOT: { end: null }
      },
      orderBy: {
        start: "desc"
      }
    })
  }
  async getWinCountByUser(intra_tag: string) {
    return this.prismaService.matches.count({
      where: {
        AND: [
          {
            NOT: {
              end: null
            }
          },
          {
            OR: [
              {
                AND: [
                  {
                    p_one: intra_tag
                  },
                  {
                    p_one_score: {
                      gt: this.prismaService.matches.fields.p_two_score
                    }
                  }
                ]
              },
              {
                AND: [
                  {
                    p_two: intra_tag
                  },
                  {
                    p_two_score: {
                      gt: this.prismaService.matches.fields.p_one_score
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    });
  }
  async getLossCountByUser(intra_tag: string) {
    return this.prismaService.matches.count({
      where: {
        AND: [
          {
            NOT: {
              end: null
            }
          },
          {
            OR: [
              {
                AND: [
                  {
                    p_one: intra_tag
                  },
                  {
                    p_one_score: {
                      lt: this.prismaService.matches.fields.p_two_score
                    }
                  }
                ]
              },
              {
                AND: [
                  {
                    p_two: intra_tag
                  },
                  {
                    p_two_score: {
                      lt: this.prismaService.matches.fields.p_one_score
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    });
  }
  async getTieCountByUser(intra_tag: string) {
    return this.prismaService.matches.count({
      where: {
        AND: [
          {
            NOT: {
              end: null
            }
          },
          {
            OR: [
              {
                AND: [
                  {
                    p_one: intra_tag
                  },
                  {
                    p_one_score: {
                      equals: this.prismaService.matches.fields.p_two_score
                    }
                  }
                ]
              },
              {
                AND: [
                  {
                    p_two: intra_tag
                  },
                  {
                    p_two_score: {
                      equals: this.prismaService.matches.fields.p_one_score
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    });
  }
  async getStatsByUser(intra_tag: string) {
    const matches = await this.prismaService.matches.findMany({
      where: {
        OR: [
          { p_one: intra_tag },
          { p_two: intra_tag }
        ]
      }
    })
    const response = {
      win: 0,
      loss: 0,
      tie: 0,
      indeterminate: 0
    }
    const aggregated = matches.map(e => {
      const myScore = e.p_one === intra_tag ? e.p_one_score : e.p_two_score;
      const adScore = e.p_one === intra_tag ? e.p_two_score : e.p_one_score;
      let status: 'indeterminate' | 'win' | 'tie' | 'loss' = 'indeterminate';
      if (e.end !== null) {
        if (myScore - adScore > 0)
          status = 'win'
        else if (myScore - adScore === 0)
          status = 'tie'
        else
          status = 'loss'
      }
      return {
        defined: e.end !== null,
        status
      }
    });
    aggregated.forEach(rec => {
      switch (rec.status) {
        case ('indeterminate'):
          response.indeterminate++;
          break;
        case ('win'):
          response.win++;
          break;
        case ('tie'):
          response.tie++;
          break;
        case ('loss'):
          response.loss++;
          break;
      }
    })
    return response;
  }
  async deleteMatchById(matchId: string) {
    return this.prismaService.matches.delete({
      where: {
        id: matchId
      }
    })
  }
  async deleteHungMatches() {
    return this.prismaService.matches.deleteMany({
      where: {
        NOT: {
          end: null
        }
      }
    })
  }
  async getUserRank(intra_tag: string) {
    const users = await this.prismaService.users.findMany({
      select: {
        intra_login: true,
        elo: true
      },
      orderBy: {
        elo: 'desc'
      }
    })
    const i = users.findIndex((user) => user.intra_login === intra_tag);
    if (i === -1)
      throw new NotFoundException(`User ${intra_tag} not found`);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60000);
    const matches = await this.prismaService.matches.findMany({
      select: {
        id: true,
        p_one_score: true,
        p_two_score: true,
        start: true,
        end: true,
        status: true,
        player_one: {
          select: {
            id: true, nickname: true
          }
        },
        player_two: {
          select: {
            id: true, nickname: true
          }
        }
      },
      where: {
        OR: [
          {
            p_one: intra_tag
          },
          {
            p_two: intra_tag
          }
        ],
        end: {
          gte: tenMinutesAgo
        },
        NOT: { end: null },
        status: {
          in: ['aborted', 'finished']
        }
      },
      orderBy: {
        start: "desc"
      }
    });
    let variation = 0;
    matches.forEach(m => {
      const myScore = m.player_one.id === intra_tag ? m.p_one_score : m.p_two_score;
      const adScore = m.player_one.id === intra_tag ? m.p_two_score : m.p_one_score;
      const won = myScore > adScore;
      if (m.status === 'finished') {
        variation += won ? 10 : -10
      } else if (m.status === 'aborted') {
        variation += won ? 10 : -20
      }
    })
    return {
      rank: i + 1,
      elo: users[i].elo,
      variation
    }
  }
}

