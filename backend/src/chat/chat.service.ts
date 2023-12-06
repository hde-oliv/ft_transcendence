import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
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
import { WsException } from '@nestjs/websockets';
import { SocketGateway } from './chat.gateway';
import { WebsocketService } from './websocket.service';
import * as bcrypt from 'bcrypt';
import { CreateCatDto } from '../cats/dto/create-cat.dto';
import e from 'express';

// TODO: try except blocks
// TODO: How banned will work on frontend?
// TODO: Check if everything works on yourself | NO, does not work, specially the create Channel function because it tries to create the membership twice

@Injectable()
export class ChatService {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private chatRepository: ChatRepository,
    private socketService: WebsocketService
  ) { }

  private readonly logger = new Logger(ChatService.name);

  // NOTE: Who made the request must not be present in the members array
  async createChannel(token: TokenClaims, createChannelDto: CreateChannelDto) {

    const saltOrRounds = 0;
    const hash = await bcrypt.hash(createChannelDto.password, saltOrRounds);
    createChannelDto.password = hash;

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
      this.socketService.addUserToRoom(first.userId, chat.id.toString());
      this.socketService.addUserToRoom(second.userId, chat.id.toString());
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
    this.socketService.emitToRoom(chat.id.toString(), 'syncChannel', { channelId: chat.id });
    return chat;
  }

  async getChannelsByUser(user: TokenClaims) {
    const data = await this.chatRepository.getChannelsByUser(user);
    if (data) {
      return data.Memberships;
    }
    return [];
  }

  async getSingleChannel(user: TokenClaims, channelId: number) {
    let channel;

    try {
      channel = await this.chatRepository.getSingleChannel(user, channelId);
    } catch (e) {
      throw new NotFoundException('Channel does not exist.');
    }

    return channel;
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
  ): Promise<Channels> {
    const channel = await this.chatRepository.getChannel(id);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    this.checkOwner(token.intra_login, memberships);

    const saltOrRounds = 0;
    const hash = await bcrypt.hash(UpdateChannelDto.password, saltOrRounds);
    UpdateChannelDto.password = hash;
    const updatedChannel = await this.chatRepository.updateChannel(
      channel.id,
      UpdateChannelDto,
    );
    this.socketService.emitToRoom(updatedChannel.id.toString(), 'syncChannel', { channelId: updatedChannel.id })
    return updatedChannel;
  }

  // NOTE: Only the owner can delete channel
  // throws
  async deleteChannel(token: TokenClaims, id: number) {
    const channel = await this.chatRepository.getChannel(id);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    this.checkOwner(token.intra_login, memberships);

    // Not checking for throws 'cause I already got the channel
    await this.chatRepository.deleteMembershipsbyChannel(channel.id);
    const deletedChannel = await this.chatRepository.deleteChannel(channel.id);
    this.socketService.server.sockets.socketsLeave(channel.id.toString()); //TODO verify if working properly
    return deletedChannel;
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

    const isMatch = await bcrypt.compare(joinChannelDto.password, channel.password);

    // check if password is correct
    if (channel.protected) {
      if (isMatch !== true) {
        throw new ForbiddenException('Wrong password.');
      }
    }

    const newMember: CreateMembershipDto = {
      channelId: channel.id,
      userId: token.intra_login,
    };
    const membership = await this.chatRepository.createMembership(newMember);
    this.socketService.addUserToRoom(membership.userId, membership.channelId.toString());
    this.socketService.emitToRoom(membership.channelId.toString(), 'syncChannel', { channelId: membership.channelId });
  }

  // throws
  async leaveChannel(token: TokenClaims, channelId: number) {
    const channel = await this.chatRepository.getChannel(channelId);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    await this.checkMembership(token.intra_login, memberships);
    const deletedMembership = await this.chatRepository.deleteMembership(
      token.intra_login,
      channel.id,
    );
    this.socketService.removeUserFromRoom(token.intra_login, channelId.toString());
    this.socketService.emitToRoom(channelId.toString(), 'syncChannel', { channelId: channelId });
    return deletedMembership;
  }
  private getIssuerTargetMemberships(memberships: Memberships[], token: TokenClaims, userId: string, channel: Channels) {
    if (userId === token.intra_login)
      throw new BadRequestException('You cannot perform this action on yourself.');
    const issuerMembership = memberships.find(e => e.userId === token.intra_login);
    const targetMembership = memberships.find(e => e.userId === userId);
    if (!issuerMembership)
      throw new BadRequestException(`${token.intra_login} is not a member of ${channel.name}.`)
    if (!targetMembership)
      throw new BadRequestException(`${userId} is not a member of ${channel.name}.`)
    return { issuerMembership, targetMembership };
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

    this.checkOwner(token.intra_login, memberships);

    const newMembership = await this.chatRepository.createMembership(createMembershipDto);
    this.socketService.addUserToRoom(newMembership.userId, channel.id.toString())
    this.socketService.emitToRoom(newMembership.channelId.toString(), 'syncChannel', { channelId: channel.id });
    return newMembership;
  }

  // NOTE: Administrator can only kick/ban/mute
  // throws
  async kickUser(token: TokenClaims, channelId: number, userId: string) {
    const channel = await this.chatRepository.getChannel(channelId);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );

    const { issuerMembership, targetMembership } = this.getIssuerTargetMemberships(memberships, token, userId, channel);

    this.checkSelf(token.intra_login, userId);
    if (!issuerMembership.administrator || !issuerMembership.owner)
      throw new ForbiddenException(`You can't kick other members`);
    if (targetMembership.owner)
      throw new ForbiddenException(`Channel owner cannot be kicked`);
    if (targetMembership.administrator && !issuerMembership.owner)
      throw new ForbiddenException(`Only channel owner can kick administrators`);

    await this.chatRepository.deleteMembership(userId, channel.id);
    this.socketService.emitToUser(targetMembership.userId, 'leaveChannel', { channelId: channelId });
    this.socketService.emitToUser(targetMembership.userId, 'kicked', { name: channel.name });
    this.socketService.emitToRoom(channelId.toString(), 'syncChannel', { channelId: channelId });
    this.socketService.removeUserFromRoom(targetMembership.userId, channelId.toString());
    return {}
  }

  async banUpdater(token: TokenClaims, channelId: number, userId: string, banned: boolean) {
    const channel = await this.chatRepository.getChannel(channelId);
    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );
    const { issuerMembership, targetMembership } = this.getIssuerTargetMemberships(memberships, token, userId, channel);

    if (!issuerMembership.administrator || !issuerMembership.owner)
      throw new ForbiddenException(`You can't change the ban status of other members`);
    if (targetMembership.owner)
      throw new ForbiddenException(`Channel owner cannot be banned/unbanned`);
    if (targetMembership.administrator && !issuerMembership.owner)
      throw new ForbiddenException(`Only channel owner can ban/unban administrators`);

    const updatedMembership = await this.chatRepository.updateMembershipById(targetMembership.id, { banned: banned }) //TODO this action should also remove the user from the channel room
    if (updatedMembership.banned) {
      this.socketService.emitToUser(userId, 'leaveChannel', { channelId: channelId });
      this.socketService.emitToUser(targetMembership.userId, 'banned', { name: channel.name, banned: true });
      this.socketService.removeUserFromRoom(userId, channelId.toString());
    } else {
      this.socketService.emitToUser(targetMembership.userId, 'banned', { name: channel.name, banned: false });
      this.socketService.addUserToRoom(userId, channelId.toString());
    }
    this.socketService.emitToRoom(channelId.toString(), 'syncChannel', { channelId: channelId });
    return updatedMembership;
  }

  // throws
  async muteUser(token: TokenClaims, channelId: number, userId: string) {
    const channel = await this.chatRepository.getChannel(channelId);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );
    const { issuerMembership, targetMembership } = this.getIssuerTargetMemberships(memberships, token, userId, channel);

    this.checkSelf(token.intra_login, userId);
    if (!(issuerMembership.administrator || issuerMembership.owner))
      throw new ForbiddenException('Only Administrators can mute/unmute other users.');
    if (targetMembership.owner)
      throw new ForbiddenException('You cannot mute the channel owner');
    const updatedMembership = await this.chatRepository.updateMembership(userId, channel.id, {
      muted: true,
    });
    this.socketService.emitToRoom(channelId.toString(), 'syncChannel', { channelId: channelId });
    return updatedMembership
  }

  // throws
  async unmuteUser(token: TokenClaims, channelId: number, userId: string) {
    const channel = await this.chatRepository.getChannel(channelId);

    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );
    const { issuerMembership, targetMembership } = this.getIssuerTargetMemberships(memberships, token, userId, channel);

    this.checkSelf(token.intra_login, userId);
    if (!(issuerMembership.administrator || issuerMembership.owner))
      throw new ForbiddenException('Only Administrators can mute/unmute other users.');
    if (targetMembership.owner)
      throw new ForbiddenException('You cannot mute the channel owner');
    const updatedMembership = await this.chatRepository.updateMembership(userId, channel.id, {
      muted: false,
    });
    this.socketService.emitToRoom(channelId.toString(), 'syncChannel', { channelId: channelId });
    return updatedMembership
  }

  async adminUpdater(token: TokenClaims, channelId: number, userId: string, isAdmin: boolean) {
    const channel = await this.chatRepository.getChannel(channelId);
    const memberships = await this.chatRepository.getMembershipsbyChannel(
      channel.id,
    );
    const { issuerMembership, targetMembership } = this.getIssuerTargetMemberships(memberships, token, userId, channel);
    if (!issuerMembership.owner)
      throw new ForbiddenException(`Only channel owner can promote and demote admins`);
    const updatedMembership = await this.chatRepository.updateMembershipById(targetMembership.id, { administrator: isAdmin });
    this.socketService.emitToRoom(channelId.toString(), 'syncChannel', { channelId: channelId });
    return updatedMembership
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
  checkOwner(userId: string, memberships: Memberships[]) {
    const membership = memberships.find(
      (m) => m.userId === userId && m.owner === true,
    );

    if (!membership) {
      throw new ForbiddenException('Not owner.');
    }
  }

  // throws
  checkMembership(userId: string, memberships: Memberships[]) {
    const membership = memberships.find((m) => m.userId === userId);

    if (!membership) {
      throw new BadRequestException('Not member.');
    }
  }

  // throws
  checkBan(userId: string, memberships: Memberships[]) {
    const membership = memberships.find(
      (m) => m.userId === userId && m.banned === true,
    );

    if (membership) {
      throw new ForbiddenException('Banned.');
    }
  }

  // throws
  checkAdmin(userId: string, memberships: Memberships[]) {
    const membership = memberships.find(
      (m) => m.userId === userId && m.administrator === true);

    if (!membership) {
      throw new ForbiddenException('Not administrator.');
    }
  }

  // throws
  checkSelf(userId1: string, userId2: string) {
    if (userId1 === userId2) {
      throw new ForbiddenException('You cannot alter yourself.');
    }
  }

  async getUserFromSocket(socket: Socket) {
    const token = socket.handshake.headers.authorization
      ? socket.handshake.headers.authorization
      : '';

    if (token === '') {
      throw new WsException('Invalid credentials.');
    }

    let payload;

    try {
      payload = await this.authService.decodeToken(token);
      if (!payload) {
        throw new WsException('Invalid credentials.');
      }
    } catch (e) {
      throw new WsException('Invalid credentials.');
    }

    let user: Users;
    try {
      user = await this.userService.getUserByIntra({
        intra_login: payload.intra_login,
      });
    } catch (e) {
      throw new WsException('User not found.');
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

  async getChannelMessages(channelId: number, user: TokenClaims) {
    channelId = Number(channelId);
    if (typeof channelId !== 'number' || !Number.isInteger(channelId))
      throw new BadRequestException();
    return await this.chatRepository.getChannelMessages(channelId, user);
  }

  async getChannelByName(name: string) {
    return await this.chatRepository.getChannelByName(name);
  }

  async getChannelDataById(channelId: any) {
    channelId = Number(channelId);
    if (typeof channelId !== 'number' || !Number.isInteger(channelId)) {
      throw new BadRequestException();
    }
    return this.chatRepository.getUsersByChannel(channelId);
  }
}
