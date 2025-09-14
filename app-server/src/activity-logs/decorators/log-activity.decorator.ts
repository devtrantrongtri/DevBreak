import { SetMetadata } from '@nestjs/common';
import { ActivityAction, ActivityResource } from '../dto';

export interface LogActivityOptions {
  action?: ActivityAction;
  resource?: ActivityResource;
  description?: string;
  includeBody?: boolean;
  includeResponse?: boolean;
}

export const LOG_ACTIVITY_KEY = 'log_activity';

export const LogActivity = (options: LogActivityOptions = {}) => 
  SetMetadata(LOG_ACTIVITY_KEY, options);
