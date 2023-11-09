import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message-dto';
import { Channels, Memberships, Users } from '@prisma/client';
import { ChatRepository } from './chat.repository';
import { CreateMembershipDto } from './dto/create-membership-dto';
import { CreateChannelDto } from './dto/create-channel-dto';
import { TokenClaims } from 'src/auth/auth.model';
import { UpdateChannelDto } from './dto/update-channel-dto';
import { JoinChannelDto } from './dto/join-channel-dto';

// TODO: try except blocks
// TODO: How banned will work on frontend?
// TODO: Check if everything works on yourself | NO, does not work, specially the create Channel function because it tries to create the membership twice

@Injectable()
export class ChatService {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private chatRepository: ChatRepository,
  ) {}

  private readonly logger = new Logger(ChatService.name);

  // NOTE: Who made the request must not be present in the members array
  async createChannel(token: TokenClaims, createChannelDto: CreateChannelDto) {
    const chat: Channels = await this.chatRepository.createChannel(
      createChannelDto,
    );

    if (createChannelDto.user2user) {
      const first: CreateMembershipDto = {
        channelId: chat.id,
        userId: token.intra_login,
      };

      const second: CreateMembershipDto = {
        channelId: chat.id,
        userId: createChannelDto.members[0],
      };

      await this.chatRepository.createMembership(first);
      await this.chatRepository.createMembership(second);
    } else {
      const owner: CreateMembershipDto = {
        channelId: chat.id,
        userId: token.intra_login,
        owner: true,
        administrator: true,
      };
      await this.chatRepository.createMembership(owner);

      for (let i = 0; i < createChannelDto.members.length; i++) {
        const user: CreateMembershipDto = {
          channelId: chat.id,
          userId: createChannelDto.members[i],
        };

        await this.chatRepository.createMembership(user);
      }
    }

    return chat;
  }

  async getChannelsByUser(user: TokenClaims) {
    return this.chatRepository.getChannelsByUser(user);
  }
  // throws
  async getChannel(id: number) {
    let channel: Channels;

    try {
      channel = await this.chatRepository.getChannel(id);
    } catch (e) {
      throw new NotFoundException('Channel does not exist.');
    }

    return channel;
  }

  async getAllChannels() {
    return await this.chatRepository.getAllChannels();
  }

  // NOTE: Only the owner can update channel
  // throws
  async updateChannel(
    id: number,
    token: TokenClaims,
    UpdateChannelDto: UpdateChannelDto,
  ) {
    const channel = await this.chatRepository.getChannel(id);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    // TODO: Should be async?
    await this.checkOwner(token.intra_login, memberships);

    return await this.chatRepository.updateChannel(
      channel.id,
      UpdateChannelDto,
    );
  }

  // NOTE: Only the owner can delete channel
  // throws
  async deleteChannel(token: TokenClaims, id: number) {
    const channel = await this.chatRepository.getChannel(id);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    await this.checkOwner(token.intra_login, memberships);

    // Not checking for throws 'cause I already got the channel
    await this.chatRepository.deleteMembershipsbyChannel(channel.id);

    return await this.chatRepository.deleteChannel(channel.id);
  }

  // throws
  async joinChannel(token: TokenClaims, joinChannelDto: JoinChannelDto) {
    const channel = await this.chatRepository.getChannel(
      joinChannelDto.channelId,
    );

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    await this.checkBan(token.intra_login, memberships);

    // check if password is correct
    if (channel.protected) {
      if (channel.password !== joinChannelDto.password) {
        throw new UnauthorizedException('Wrong password.');
      }
    }

    const newMember: CreateMembershipDto = {
      channelId: channel.id,
      userId: token.intra_login,
    };

    return await this.chatRepository.createMembership(newMember);
  }

  // throws
  async leaveChannel(token: TokenClaims, channelId: number) {
    const channel = await this.chatRepository.getChannel(channelId);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    await this.checkMembership(token.intra_login, memberships);

    return await this.chatRepository.deleteMembership(
      token.intra_login,
      channel.id,
    );
  }

  // throws
  async inviteUser(
    token: TokenClaims,
    createMembershipDto: CreateMembershipDto,
  ) {
    const channel = await this.chatRepository.getChannel(
      createMembershipDto.channelId,
    );

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    await this.checkOwner(token.intra_login, memberships);

    return await this.chatRepository.createMembership(createMembershipDto);
  }

  // NOTE: Administrator can only kick/ban/mute
  // throws
  async kickUser(token: TokenClaims, channelId: number, userId: string) {
    const channel = await this.chatRepository.getChannel(channelId);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    await this.checkSelf(token.intra_login, userId);
    await this.checkAdmin(token.intra_login, memberships);

    // If throws, the another user is not a Owner or Admin (ALL Owners are Admins)
    try {
      await this.checkAdmin(userId, memberships);
      throw new UnauthorizedException('Cannot kick an Admin/Owner.');
    } catch (e) {
      return await this.chatRepository.deleteMembership(userId, channel.id);
    }
  }

  // throws
  async banUser(token: TokenClaims, channelId: number, userId: string) {
    const channel = await this.chatRepository.getChannel(channelId);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    await this.checkSelf(token.intra_login, userId);
    await this.checkAdmin(token.intra_login, memberships);

    // If throws, the another user is not a Owner or Admin (ALL Owners are Admins)
    try {
      await this.checkAdmin(userId, memberships);
      throw new UnauthorizedException('Cannot kick an Admin/Owner.');
    } catch (e) {
      return await this.chatRepository.updateMembership(userId, channel.id, {
        banned: true,
      });
    }
  }

  // throws
  async unbanUser(token: TokenClaims, channelId: number, userId: string) {
    const channel = await this.chatRepository.getChannel(channelId);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    await this.checkSelf(token.intra_login, userId);
    await this.checkAdmin(token.intra_login, memberships);

    // If throws, the another user is not a Owner or Admin (ALL Owners are Admins)
    try {
      await this.checkAdmin(userId, memberships);
      throw new UnauthorizedException('Cannot kick an Admin/Owner.');
    } catch (e) {
      return await this.chatRepository.updateMembership(userId, channel.id, {
        banned: false,
      });
    }
  }

  // throws
  async muteUser(token: TokenClaims, channelId: number, userId: string) {
    const channel = await this.chatRepository.getChannel(channelId);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    await this.checkSelf(token.intra_login, userId);
    await this.checkAdmin(token.intra_login, memberships);

    // If throws, the another user is not a Owner or Admin (ALL Owners are Admins)
    try {
      await this.checkAdmin(userId, memberships);
      throw new UnauthorizedException('Cannot kick an Admin/Owner.');
    } catch (e) {
      return await this.chatRepository.updateMembership(userId, channel.id, {
        muted: true,
      });
    }
  }

  // throws
  async unmuteUser(token: TokenClaims, channelId: number, userId: string) {
    const channel = await this.chatRepository.getChannel(channelId);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    await this.checkSelf(token.intra_login, userId);
    await this.checkAdmin(token.intra_login, memberships);

    // If throws, the another user is not a Owner or Admin (ALL Owners are Admins)
    try {
      await this.checkAdmin(userId, memberships);
      throw new UnauthorizedException('Cannot kick an Admin/Owner.');
    } catch (e) {
      return await this.chatRepository.updateMembership(userId, channel.id, {
        muted: false,
      });
    }
  }

  // throws
  async setAdminUser(token: TokenClaims, channelId: number, userId: string) {
    const channel = await this.chatRepository.getChannel(channelId);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    await this.checkSelf(token.intra_login, userId);
    await this.checkOwner(token.intra_login, memberships);

    return await this.chatRepository.updateMembership(userId, channel.id, {
      administrator: true,
    });
  }

  // throws
  async unsetAdminUser(token: TokenClaims, channelId: number, userId: string) {
    const channel = await this.chatRepository.getChannel(channelId);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    await this.checkSelf(token.intra_login, userId);
    await this.checkOwner(token.intra_login, memberships);

    return await this.chatRepository.updateMembership(userId, channel.id, {
      administrator: false,
    });
  }

  async getDirectChannelByUsers(user1: string, user2: string) {
    this.logger.warn('Here!');
    return await this.chatRepository.getUtUChannelByUsers(user1, user2);
  }

  // throws
  async getMembershipsbyChannel(channelId: number) {
    return await this.chatRepository.getMembershipsbyChannel(channelId);
  }

  // throws
  async getMembershipsbyUser(userId: string) {
    return await this.chatRepository.getMembershipsbyUser(userId);
  }

  // throws
  async checkOwner(userId: string, memberships: Memberships[]) {
    const membership = memberships.find(
      (m) => m.userId === userId && m.owner === true,
    );

    if (!membership) {
      throw new UnauthorizedException('Not owner.');
    }
  }

  // throws
  async checkMembership(userId: string, memberships: Memberships[]) {
    const membership = memberships.find((m) => m.userId === userId);

    if (!membership) {
      throw new BadRequestException('Not member.');
    }
  }

  // throws
  async checkBan(userId: string, memberships: Memberships[]) {
    const membership = memberships.find(
      (m) => m.userId === userId && m.banned === true,
    );

    if (membership) {
      throw new UnauthorizedException('Banned.');
    }
  }

  // throws
  async checkAdmin(userId: string, memberships: Memberships[]) {
    const membership = memberships.find(
      (m) => m.userId === userId && m.administrator === true,
    );

    if (!membership) {
      throw new UnauthorizedException('Not administrator.');
    }
  }

  // throws
  async checkSelf(userId1: string, userId2: string) {
    if (userId1 !== userId2) {
      throw new UnauthorizedException('Trying to alter yourself.');
    }
  }

  async getUserFromSocket(socket: Socket) {
    this.logger.error(socket.handshake.headers.authorization);

    const token = socket.handshake.headers.authorization
      ? socket.handshake.headers.authorization
      : '';

    if (token === '') {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload = await this.authService.decodeToken(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    let user: Users;
    try {
      user = await this.userService.getUserByIntra({
        intra_login: payload.intra_login,
      });
    } catch (e) {
      throw new InternalServerErrorException();
    }

    return user;
  }

  async registerNewMessage(data: NewMessageDto, user: Users) {
    return await this.chatRepository.registerNewMessage(data, user.id);
  }

  async getValidMembershipsFromChannel(channelId: number) {
    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channelId,
    );

    const validMemberships = memberships.filter((m) => {
      return m.banned === false;
    });

    return validMemberships;
  }

  async getChannelMessages(channelId: number) {
    return await this.chatRepository.getChannelMessages(channelId);
  }

  async getChannelByName(name: string) {
    return await this.chatRepository.getChannelByName(name);
  }
}
