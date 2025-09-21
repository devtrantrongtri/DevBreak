import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

@WSGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/activities',
})
export class ActivityWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ActivityWebSocketGateway.name);
  private connectedClients = new Map<string, AuthenticatedSocket>();

  constructor(
    private jwtService: JwtService,
    private activityLogsService: ActivityLogsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Xác thực token từ query hoặc headers
      const token = client.handshake.auth?.token || 
                   client.handshake.query?.token as string;

      if (!token) {
        this.logger.warn(`Client ${client.id} kết nối không có token`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      client.userId = payload.sub;
      client.userEmail = payload.email;

      // Lưu client đã xác thực
      this.connectedClients.set(client.id, client);

      // Join room theo userId để gửi thông báo cá nhân
      client.join(`user_${client.userId}`);
      client.join('all_activities'); // Room chung cho tất cả hoạt động

      this.logger.log(`Người dùng ${client.userEmail} đã kết nối (${client.id})`);
      
      // Gửi thông báo kết nối thành công
      client.emit('connected', {
        message: 'Kết nối thành công',
        userId: client.userId,
        timestamp: new Date().toISOString(),
      });

      // Gửi hoạt động gần đây khi kết nối
      const recentActivities = await this.activityLogsService.findRecent(10);
      client.emit('recent_activities', recentActivities);

    } catch (error) {
      this.logger.error(`Lỗi xác thực client ${client.id}:`, error.message);
      client.emit('auth_error', { message: 'Token không hợp lệ' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Người dùng ${client.userEmail || 'Unknown'} đã ngắt kết nối (${client.id})`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string }
  ) {
    client.join(data.room);
    this.logger.log(`Client ${client.id} đã tham gia room: ${data.room}`);
    client.emit('joined_room', { room: data.room });
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string }
  ) {
    client.leave(data.room);
    this.logger.log(`Client ${client.id} đã rời room: ${data.room}`);
    client.emit('left_room', { room: data.room });
  }

  @SubscribeMessage('get_recent_activities')
  async handleGetRecentActivities(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { limit?: number }
  ) {
    try {
      const activities = await this.activityLogsService.findRecent(data.limit || 10);
      client.emit('recent_activities', activities);
    } catch (error) {
      client.emit('error', { message: 'Không thể tải hoạt động gần đây' });
    }
  }

  // Phương thức để gửi hoạt động mới đến tất cả clients
  broadcastNewActivity(activity: any) {
    this.server.to('all_activities').emit('new_activity', {
      ...activity,
      timestamp: new Date().toISOString(),
    });
  }

  // Phương thức để gửi hoạt động đến user cụ thể
  sendActivityToUser(userId: string, activity: any) {
    this.server.to(`user_${userId}`).emit('user_activity', {
      ...activity,
      timestamp: new Date().toISOString(),
    });
  }

  // Phương thức để gửi thông báo hệ thống
  broadcastSystemNotification(notification: {
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    data?: any;
  }) {
    this.server.to('all_activities').emit('system_notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  // Lấy số lượng clients đang kết nối
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Lấy danh sách users đang online
  getOnlineUsers(): Array<{ userId: string; userEmail: string; socketId: string }> {
    return Array.from(this.connectedClients.values()).map(client => ({
      userId: client.userId!,
      userEmail: client.userEmail!,
      socketId: client.id,
    }));
  }
}
