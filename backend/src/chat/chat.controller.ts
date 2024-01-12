import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ParseIntPipe,
  UseGuards,
  Request,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/zodPipe';
import { ChatService } from './chat.service';
import {
  createChannelSchema,
  CreateChannelDto,
} from './dto/create-channel-dto';
import {
  UpdateChannelDto,
  updateChannelData,
  updateChannelPassword,
  updateChannelSchema,
} from './dto/update-channel-dto';
import {
  CreateMembershipDto,
  createMembershipSchema,
} from './dto/create-membership-dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { JoinChannelDto, joinChannelSchema } from './dto/join-channel-dto';
import { MembershipDto, membershipSchema } from './dto/membership-dto';
import { BlockUserStatusDto } from './dto/block-user-status-dto';
import { TokenClaims } from 'src/auth/auth.model';
import { Response } from 'express';

// TODO: Block user logic

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @UseGuards(JwtAuthGuard)
  @Get('/mychannels')
  async getUserChannels(@Request() req) {
    return this.chatService.getChannelsByUser(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(createChannelSchema))
  @Post('/channel')
  async createChannel(
    @Request() req,
    @Body() createChannelDto: CreateChannelDto,
  ) {
    return this.chatService.createChannel(req.user, createChannelDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/channel')
  async getAllChannels() {
    return this.chatService.getAllChannels();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/channel/public')
  async getAllPublicChannels() {
    return this.chatService.getAllPublicChannels();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/channel/user/:id')
  async getUserCheckInChannel(
    @Request() req,
    @Param('id', ParseIntPipe) id: number) {
    return this.chatService.getUserCheckInChannel(req.user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/channel/:id')
  async getChannel(
    @Request() req,
    @Param('id', ParseIntPipe) id: number) {
    return this.chatService.getSingleChannel(req.user, id);
  }

  @UseGuards(JwtAuthGuard)
  // @UsePipes(new ZodValidationPipe(updateChannelSchema))
  @Patch('/channel/:id')
  async updateChannel(
    @Request() req,
    @Body() body: UpdateChannelDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const channelDataSchema = updateChannelData;
    const channelPswSchema = updateChannelPassword;
    if (channelDataSchema.safeParse(body).success || channelPswSchema.safeParse(body).success)
      return this.chatService.updateChannel(id, req.user, body);
    else
      throw new BadRequestException('Data provided is invalid');
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/channel/:id')
  async deleteChannel(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return await this.chatService.deleteChannel(req.user, id);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(joinChannelSchema))
  @Post('/channel/user/join')
  async joinChannel(@Request() req, @Body() body: JoinChannelDto) {
    return this.chatService.joinChannel(req.user, body);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(createMembershipSchema))
  @Post('/channel/user/invite')
  async inviteUser(@Request() req, @Body() body: CreateMembershipDto) {
    return this.chatService.inviteUser(req.user, body);
  }

  // NOTE: Administrator can only kick/ban/mute
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(membershipSchema))
  @Post('/channel/user/kick')
  async kickUser(@Request() req, @Body() body: MembershipDto) {
    return this.chatService.kickUser(req.user, body.channelId, body.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/channel/user/leave')
  async leaveChannel(@Request() req, @Body() body: MembershipDto) {
    return this.chatService.leaveChannel(req.user, body.channelId, body.userId);
  }


  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(membershipSchema))
  @Post('/channel/user/ban')
  async banUser(@Request() req, @Body() body: MembershipDto) {
    return this.chatService.banUpdater(req.user, body.channelId, body.userId, true)
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(membershipSchema))
  @Post('/channel/user/unban')
  async unbanUser(@Request() req, @Body() body: MembershipDto) {
    return this.chatService.banUpdater(req.user, body.channelId, body.userId, false)
  }

  // TODO: temporarily mute user
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(membershipSchema))
  @Post('/channel/user/mute')
  async muteUser(@Request() req, @Body() body: MembershipDto) {
    return this.chatService.muteUser(req.user, body.channelId, body.userId);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(membershipSchema))
  @Post('/channel/user/unmute')
  async unmuteUser(@Request() req, @Body() body: MembershipDto) {
    return this.chatService.unmuteUser(req.user, body.channelId, body.userId);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(membershipSchema))
  @Post('/channel/user/admin')
  async setAdminUser(@Request() req, @Body() body: MembershipDto) {
    return this.chatService.adminUpdater(req.user, body.channelId, body.userId, true)
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(membershipSchema))
  @Post('/channel/user/unadmin')
  async unsetAdminUser(@Request() req, @Body() body: MembershipDto) {
    return this.chatService.adminUpdater(req.user, body.channelId, body.userId, false)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/channel/:id/messages')
  async getChannelMessages(@Request() req, @Param('id') id: number) {
    return this.chatService.getChannelMessages(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/channel/:id/users')
  async getChannelUsers(@Request() req, @Param('id') id: any) {
    return this.chatService.getChannelDataById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/block')
  async blockUser(@Request() req, @Body() body: BlockUserStatusDto, @Res() res: Response) {
    let result = await this.chatService.createBlock(req.user, body);
    if (result === true) {
      return res.status(200).json({
        message: 'User was already blocked',
        blockedUser: body.targetId,
        issuer: (req.user as TokenClaims).intra_login,
      })
    }
    return res.status(201).json(result);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('/block/user/:id')
  // async getBlockUserStatus(
  //   @Request() req,
  //   @Param('id') id: string) {
  //   return this.chatService.getBlockUserStatus(req.user, id);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('/block/all')
  async getAllBlockedUsers(
    @Request() req) {
    return this.chatService.getAllBlockedUsers(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/unblock')
  async unblockUser(@Request() req, @Body() body: { target_id: string }) {
    return this.chatService.deleteBlock(req.user.intra_login, body.target_id);
  }
}
