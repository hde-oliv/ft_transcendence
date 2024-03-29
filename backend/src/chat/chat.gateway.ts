import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Injectable, Logger, Scope, UseFilters } from '@nestjs/common';
import { Channels, Memberships, Users } from '@prisma/client';
import { map, without } from 'lodash';
import { SendMessageDto } from './dto/send-message-dto';
import { ChatFilter } from './chat.filter';
import { WebsocketService } from './websocket.service';
import { UsersService } from 'src/users/users.service';
import { GameService } from 'src/game/game.service';
import { PlayerActionPayload } from 'src/game/dto/game.dto';

// NOTE: Chat only works in the /chat page
// TODO: Create a global websocket to handle user status later
// TODO: List of online users

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transpors: ['websocket', 'webtransport']
})
@Injectable({ scope: Scope.DEFAULT })
export class SocketGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly socketService: WebsocketService,
    private readonly userServive: UsersService,
    private readonly gameService: GameService
  ) { }

  private readonly logger = new Logger(SocketGateway.name);

  private clients: ClientSocket[] = [];

  @UseFilters(new ChatFilter())
  async afterInit(server: Server) {
    this.socketService.server = server;
    this.logger.log('WebSocket Gateway Initialized');
  }

  @UseFilters(new ChatFilter())
  async handleDisconnect(socket: Socket) {
    try {
      const user = await this.chatService.getUserFromSocket(socket);
      try {
        const newClients = this.clients.filter(
          (cl: ClientSocket) => cl.socket.id !== socket.id,
        );
        this.clients = newClients;
        this.socketService.clients = newClients;
        const updater = this.userServive.updateUserOnline(user, false);
        const rooms = await this.chatService.getRoomsByUser(user);
        socket.to(rooms).emit('updateUser', {
          intra_login: user.intra_login,
          status: 'offline'
        })
        //TODO: inform games in which player is in, he is now offline!
        this.logger.log(`Client Disconnected: ${socket.id}`);
        await updater;
      } catch (e) {
        this.logger.warn(`Could't perform operations on sokcet ${socket.id}`);
      }
    } catch (e) {
      this.logger.warn(`Could't get user data from socket ${socket.id} - disconnected`);
    }

  }

  @UseFilters(new ChatFilter())
  async handleConnection(socket: Socket) { //set user as online!
    try {
      const user = await this.chatService.getUserFromSocket(socket);
      try {
        const clientSocket = { user, socket };
        this.socketService.clients = [...this.clients, clientSocket];
        this.clients = [...this.clients, clientSocket];
        this.logger.log(`Client Connected: ${socket.id}`);
        const channels = await this.chatService.getRoomsByUser(user);
        const games = this.gameService.getGamesByUser(user.intra_login);
        this.logger.log(games);
        const allRooms = [...channels, ...games, user.intra_login];
        const allPromises: Array<Promise<any | void> | void> = []
        allPromises.push(this.userServive.updateUserOnline(user, true));
        socket.to(channels).emit('updateUser', {
          intra_login: user.intra_login,
          status: 'online'
        })
        allPromises.push(socket.join(allRooms));
        await Promise.allSettled(allPromises);
      } catch (e) {
        socket.rooms.forEach(e => {
          socket.leave(e);
        })
        socket.disconnect();
        if (e instanceof WsException)
          this.logger.warn(e.message)
      }
    } catch (e) {
      this.logger.warn(`Could't get user data from socket ${socket.id} - will be disconnected`)
      socket.disconnect();
    }
  }

  @UseFilters(new ChatFilter())
  @SubscribeMessage('channel_message')
  async handleMessageEvent(
    @MessageBody() data: { message: string; channelId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const user: Users = await this.chatService.getUserFromSocket(socket); //TODO: messages must be sanitized before included!
    const channel = await this.chatService.getChannel(data.channelId);
    const message = await this.chatService.registerNewMessage(
      {
        channel_id: data.channelId,
        message: data.message,
      },
      user,
    );
    if (message === undefined)
      return 'muted';
    if (channel.user2user) {
      socket.emit('server_message', { ...message, nickname: user.nickname }); //sends message to emitter!
      const target = channel.Memberships.find(member => member.userId !== user.intra_login);
      if (target) {
        if (await this.chatService.shouldSendMessage(user.intra_login, target.userId))
          socket.to(channel.id.toString()).emit('server_message', { ...message, nickname: user.nickname });
      }
    } else {
      const members = channel.Memberships.map(e => e.userId);
      const blockers = await this.chatService.getBlockersOfUser(user.id);
      const targets = members.filter(e => !blockers.includes(e));
      targets.forEach(e => {
        this.socketService.emitToUser(e, 'server_message', { ...message, nickname: user.nickname })
      })
    }
    return message;
  }

  @UseFilters(new ChatFilter())
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user: Users = await this.chatService.getUserFromSocket(socket); //TODO: messages must be sanitized before included!
    socket.join(data.roomId)
    this.socketService.addUserToRoom(user.intra_login, data.roomId);
  }

  //game listeners - Start
  @UseFilters(new ChatFilter())
  @SubscribeMessage('playerAction')
  async handlePlayerAction(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: PlayerActionPayload
  ) {
    const user = await this.chatService.getUserFromSocket(socket)
    this.gameService.gameAction(user.intra_login, data);
  }


  // @UseFilters(new ChatFilter())
  // @SubscribeMessage('playerAction')
  // async handlePlayerAction(
  //   @MessageBody() data: { gameId: string, action: { id: string, value: string } }

  // ) {

  // }
  // @SubscribeMessage('move_left_paddle')
  // async handleMoveLeftPaddle(
  //   @MessageBody() dir: number,
  //   @ConnectedSocket() socket: Socket,
  // ) {
  //   this.logger.log(
  //     `Client trying to move left paddle to: ${JSON.stringify(dir)}`,
  //   );
  //   this.game.setLeftPaddlePosition(dir);
  // }

  // @SubscribeMessage('move_right_paddle')
  // async handleMoveRightPaddle(
  //   @MessageBody() dir: number,
  //   @ConnectedSocket() socket: Socket,
  // ) {
  //   this.logger.log(
  //     `Client trying to move right paddle to: ${JSON.stringify(dir)}`,
  //   );
  //   this.game.setRightPaddlePosition(dir);
  // }
  //game listeners - End
  async broadcast(
    sender: Socket,
    targets: Socket[],
    event: string,
    message: any,
  ) {
    for (let i = 0; i < targets.length; i++) {
      targets[i].emit(event, message);
    }
  }
  getClients() {
    return this.clients
  }
  getOnlineSocketsByMemberships(memberships: Memberships[]): Socket[] {
    this.logger.warn(`Memberships: ${JSON.stringify(memberships)}`);

    const onlineUsers = memberships.filter((m) => {
      const client = this.clients.find((c) => c.user.id === m.userId);
      return client !== undefined;
    });

    this.logger.warn(`Online Users: ${JSON.stringify(onlineUsers)}`);

    // map users to socket using lodash
    const onlineSockets = map(onlineUsers, (m) => {
      const client = this.clients.find((c) => c.user.id === m.userId);
      return client?.socket;
    });

    // remove undefined values
    const onlineSocketsWithoutUndefined = without(onlineSockets, undefined);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return onlineSocketsWithoutUndefined;
  }
}

export interface ClientSocket {
  user: Users;
  socket: Socket;
}
