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
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/zodPipe';
import { ChatService } from './chat.service';
import {
  createChannelSchema,
  CreateChannelDto,
} from './dto/create-channel-dto';
import {
  UpdateChannelDto,
  updateChannelSchema,
} from './dto/update-channel-dto';
import { CreateMembershipDto } from './dto/create-membership-dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { JoinChannelDto, joinChannelSchema } from './dto/join-channel-dto';
import { MembershipDto, membershipSchema } from './dto/membership-dto';

// TODO: Block user logic

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

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
  @Get('/channel/:id')
  async getChannel(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.getChannel(id);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updateChannelSchema))
  @Patch('/channel/:id')
  async updateChannel(
    @Request() req,
    @Body() body: UpdateChannelDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.chatService.updateChannel(id, req.user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/channel/:id')
  async deleteChannel(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.chatService.deleteChannel(req.user, id);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(joinChannelSchema))
  @Post('/channel/user/join')
  async joinChannel(@Request() req, @Body() body: JoinChannelDto) {
    return this.chatService.joinChannel(req.user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/channel/user/leave/:id')
  async leaveChannel(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.chatService.leaveChannel(req.user, id);
  }

  @UseGuards(JwtAuthGuard)
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
  @UsePipes(new ZodValidationPipe(membershipSchema))
  @Post('/channel/user/ban')
  async banUser(@Request() req, @Body() body: MembershipDto) {
    return this.chatService.banUser(req.user, body.channelId, body.userId);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(membershipSchema))
  @Post('/channel/user/unban')
  async unbanUser(@Request() req, @Body() body: MembershipDto) {
    return this.chatService.unbanUser(req.user, body.channelId, body.userId);
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
    return this.chatService.setAdminUser(req.user, body.channelId, body.userId);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(membershipSchema))
  @Post('/channel/user/unadmin')
  async unsetAdminUser(@Request() req, @Body() body: MembershipDto) {
    return this.chatService.unsetAdminUser(
      req.user,
      body.channelId,
      body.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/channel/:id/messages')
  async getChannelMessages(@Request() req, @Param('id') id: number) {
    return this.chatService.getChannelMessages(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/channel/direct')
  async getDirectChannelByUsers(
    @Body() body: { user1: string; user2: string },
  ) {
    // TODO: create dto later
    return this.chatService.getDirectChannelByUsers(body.user1, body.user2);
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('/block')
  // async blockUser(@Request() req, @Body() body: UpdateMembershipDto) {
  //   return this.chatService.createBlock(req.user, body);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Post('/unblock')
  // async unblockUser(@Request() req, @Body() body: UpdateMembershipDto) {
  //   return this.chatService.deleteBlock(req.user, body);
  // }
}
