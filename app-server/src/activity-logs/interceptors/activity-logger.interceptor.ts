import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ActivityLogsService } from '../activity-logs.service';
import { ActivityAction, ActivityResource } from '../dto';

@Injectable()
export class ActivityLoggerInterceptor implements NestInterceptor {
  constructor(private activityLogsService: ActivityLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const path = request.route?.path || request.url;
    const ipAddress = this.getClientIp(request);
    const userAgent = request.headers['user-agent'];

    // Skip logging for certain paths
    if (this.shouldSkipLogging(path)) {
      return next.handle();
    }

    const activityInfo = this.extractActivityInfo(method, path, request.body, request.params);

    return next.handle().pipe(
      tap((response) => {
        // Log successful operations
        this.logActivity(
          activityInfo,
          user?.userId,
          ipAddress,
          userAgent,
          method,
          path,
          'success',
          response
        );
      }),
      catchError((error) => {
        // Log failed operations
        this.logActivity(
          activityInfo,
          user?.userId,
          ipAddress,
          userAgent,
          method,
          path,
          'error',
          null,
          error
        );
        throw error;
      })
    );
  }

  private shouldSkipLogging(path: string): boolean {
    const skipPaths = [
      '/auth/me',
      '/activity-logs',
      '/health',
      '/metrics',
    ];
    
    return skipPaths.some(skipPath => path.includes(skipPath));
  }

  private extractActivityInfo(method: string, path: string, body: any, params: any) {
    // Extract action based on HTTP method and path
    let action: ActivityAction;
    let resource: ActivityResource;
    let resourceId: string | undefined;
    let details: Record<string, any> = {};

    // Determine action from HTTP method
    switch (method) {
      case 'POST':
        action = ActivityAction.CREATE;
        break;
      case 'PUT':
      case 'PATCH':
        action = ActivityAction.UPDATE;
        break;
      case 'DELETE':
        action = ActivityAction.DELETE;
        break;
      case 'GET':
        action = ActivityAction.VIEW;
        break;
      default:
        action = ActivityAction.VIEW;
    }

    // Determine resource and resourceId from path
    if (path.includes('/users')) {
      resource = ActivityResource.USER;
      resourceId = params?.id;
      if (path.includes('/login')) {
        action = ActivityAction.LOGIN;
      }
    } else if (path.includes('/groups')) {
      resource = ActivityResource.GROUP;
      resourceId = params?.id;
    } else if (path.includes('/permissions')) {
      resource = ActivityResource.PERMISSION;
      resourceId = params?.id;
    } else if (path.includes('/menus')) {
      resource = ActivityResource.MENU;
      resourceId = params?.id;
    } else if (path.includes('/profile')) {
      resource = ActivityResource.PROFILE;
      resourceId = params?.id;
    } else {
      resource = ActivityResource.SYSTEM;
    }

    // Add relevant body data to details (excluding sensitive information)
    if (body && typeof body === 'object') {
      const { password, passwordHash, ...safeBody } = body;
      details.requestData = safeBody;
    }

    return { action, resource, resourceId, details };
  }

  private async logActivity(
    activityInfo: any,
    userId: string | undefined,
    ipAddress: string,
    userAgent: string,
    method: string,
    path: string,
    status: string,
    response?: any,
    error?: any
  ) {
    try {
      const details = { ...activityInfo.details };
      
      if (error) {
        details.error = {
          message: error.message,
          status: error.status,
        };
      }

      if (response && status === 'success') {
        // Add response metadata (without sensitive data)
        if (response?.id) {
          details.resultId = response.id;
        }
      }

      await this.activityLogsService.logActivity(
        activityInfo.action,
        activityInfo.resource,
        ipAddress,
        userId,
        activityInfo.resourceId,
        details,
        userAgent,
        method,
        path,
        status
      );
    } catch (logError) {
      // Don't throw errors from logging to avoid breaking the main operation
      console.error('Failed to log activity:', logError);
    }
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }
}
