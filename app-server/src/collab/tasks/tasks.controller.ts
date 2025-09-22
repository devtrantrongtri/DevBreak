import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Collab - Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('collab/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @RequirePermissions('collab.tasks.create')
  @ApiOperation({ summary: 'Tạo task mới' })
  @ApiResponse({ status: 201, description: 'Task được tạo thành công' })
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    return this.tasksService.create(createTaskDto, req.user.userId);
  }

  @Get()
  @RequirePermissions('collab.tasks.view')
  @ApiOperation({ summary: 'Lấy danh sách tasks theo project' })
  @ApiResponse({ status: 200, description: 'Danh sách tasks' })
  findAll(
    @Query('projectId', ParseUUIDPipe) projectId: string,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Request() req?: any,
  ) {
    return this.tasksService.findAll(projectId, req.user.userId, { status, assignedTo });
  }

  @Get(':id')
  @RequirePermissions('collab.tasks.view')
  @ApiOperation({ summary: 'Lấy chi tiết task' })
  @ApiResponse({ status: 200, description: 'Chi tiết task' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.tasksService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @RequirePermissions('collab.tasks.update')
  @ApiOperation({ summary: 'Cập nhật task' })
  @ApiResponse({ status: 200, description: 'Task được cập nhật thành công' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.userId);
  }

  @Delete(':id')
  @RequirePermissions('collab.tasks.delete')
  @ApiOperation({ summary: 'Xóa task' })
  @ApiResponse({ status: 200, description: 'Task được xóa thành công' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.tasksService.remove(id, req.user.userId);
  }

  @Post(':id/move')
  @RequirePermissions('collab.tasks.update')
  @ApiOperation({ summary: 'Di chuyển task sang status khác' })
  @ApiResponse({ status: 200, description: 'Task được di chuyển thành công' })
  moveTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() moveTaskDto: MoveTaskDto,
    @Request() req: any,
  ) {
    return this.tasksService.moveTask(id, moveTaskDto, req.user.userId);
  }

  @Post(':id/assign')
  @RequirePermissions('collab.tasks.assign')
  @ApiOperation({ summary: 'Assign task cho user' })
  @ApiResponse({ status: 200, description: 'Task được assign thành công' })
  assignTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userId', ParseUUIDPipe) userId: string,
    @Request() req: any,
  ) {
    return this.tasksService.assignTask(id, userId, req.user.userId);
  }

  @Get(':id/activities')
  @RequirePermissions('collab.tasks.view')
  @ApiOperation({ summary: 'Lấy lịch sử hoạt động của task' })
  @ApiResponse({ status: 200, description: 'Lịch sử hoạt động' })
  getActivities(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.tasksService.getTaskActivities(id, req.user.userId);
  }
}
