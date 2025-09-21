import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { ActivityWebSocketGateway } from '../../websocket/websocket.gateway';

@Injectable()
export class ActivityLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly activityLogsService: ActivityLogsService,
    @Inject(forwardRef(() => ActivityWebSocketGateway))
    private readonly webSocketGateway: ActivityWebSocketGateway,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const { method, url, ip, headers, user, body } = request;
    const userAgent = headers['user-agent'] || '';
    const userId = user?.userId;
    
    // Skip logging for certain endpoints
    if (this.shouldSkipLogging(url, method)) {
      return next.handle();
    }

    const startTime = Date.now();
    
    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        this.logActivity(
          method,
          url,
          ip,
          userAgent,
          userId,
          response.statusCode,
          'success',
          duration,
          this.extractResourceInfo(url, method, body, data)
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logActivity(
          method,
          url,
          ip,
          userAgent,
          userId,
          error.status || 500,
          'error',
          duration,
          this.extractResourceInfo(url, method, body),
          error.message
        );
        throw error;
      })
    );
  }

  private shouldSkipLogging(url: string, method: string): boolean {
    const skipPatterns = [
      '/auth/me',
      '/activity-logs/recent',
      '/dashboard/stats',
      '/dashboard/quick-stats',
      '/health',
    ];
    
    // Skip GET requests to certain endpoints to avoid noise
    if (method === 'GET' && skipPatterns.some(pattern => url.includes(pattern))) {
      return true;
    }
    
    return false;
  }

  private async logActivity(
    method: string,
    path: string,
    ipAddress: string,
    userAgent: string,
    userId?: string,
    statusCode?: number,
    status: string = 'success',
    duration?: number,
    resourceInfo?: any,
    errorMessage?: string
  ): Promise<void> {
    try {
      const action = this.getActionFromMethod(method);
      const resource = this.getResourceFromPath(path);
      
      const details: Record<string, any> = {
        duration: duration ? `${duration}ms` : undefined,
        statusCode,
        ...resourceInfo,
      };
      
      if (errorMessage) {
        details.error = errorMessage;
      }

      const activityLog = await this.activityLogsService.logActivity(
        action,
        resource,
        ipAddress,
        userId,
        resourceInfo?.resourceId,
        details,
        userAgent,
        method,
        path,
        status
      );

      // Emit realtime event qua WebSocket
      if (this.webSocketGateway && activityLog) {
        const activityData = {
          id: activityLog.id || Date.now().toString(),
          action,
          resource,
          resourceId: resourceInfo?.resourceId,
          ipAddress,
          userAgent,
          method,
          path,
          status,
          details,
          createdAt: new Date().toISOString(),
          user: userId ? {
            id: userId,
            displayName: resourceInfo?.userName || 'Người dùng',
            email: resourceInfo?.userEmail || '',
          } : null,
        };

        // Gửi đến tất cả clients
        this.webSocketGateway.broadcastNewActivity(activityData);

        // Gửi riêng cho user nếu có userId
        if (userId) {
          this.webSocketGateway.sendActivityToUser(userId, activityData);
        }
      }
    } catch (error) {
      // Don't throw errors from logging to avoid breaking the main request
      console.error('Lỗi ghi log hoạt động:', error);
    }
  }

  private getActionFromMethod(method: string): string {
    const actionMap: Record<string, string> = {
      'GET': 'view',
      'POST': 'create',
      'PUT': 'update',
      'PATCH': 'update',
      'DELETE': 'delete',
    };
    return actionMap[method] || method.toLowerCase();
  }

  private getResourceFromPath(path: string): string {
    // Extract resource from path like /users/123 -> users
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'root';
    
    // Handle special cases
    if (segments[0] === 'auth') return 'authentication';
    if (segments[0] === 'dashboard') return 'dashboard';
    
    return segments[0];
  }

  private extractResourceInfo(
    path: string, 
    method: string, 
    body?: any, 
    responseData?: any
  ): any {
    const segments = path.split('/').filter(Boolean);
    const info: any = {};
    
    // Extract resource ID from path
    if (segments.length >= 2 && this.isUUID(segments[1])) {
      info.resourceId = segments[1];
    }
    
    // Extract resource name from response or body
    if (responseData?.name) {
      info.resourceName = responseData.name;
    } else if (body?.name) {
      info.resourceName = body.name;
    }
    
    // Add specific info based on resource type
    if (segments[0] === 'users' && method === 'POST') {
      info.email = body?.email;
    } else if (segments[0] === 'groups' && method === 'POST') {
      info.groupCode = body?.code;
    }
    
    return info;
  }

  private isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
