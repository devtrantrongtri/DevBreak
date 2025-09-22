import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DailiesService } from './dailies.service';
import { CreateDailyDto } from './dto/create-daily.dto';
import { UpdateDailyDto } from './dto/update-daily.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Collab - Dailies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('collab/dailies')
export class DailiesController {
  constructor(private readonly dailiesService: DailiesService) {}

  @Post()
  @RequirePermissions('collab.dailies.create')
  @ApiOperation({ summary: 'Tạo daily report mới' })
  @ApiResponse({ status: 201, description: 'Daily report được tạo thành công' })
  create(@Body() createDailyDto: CreateDailyDto, @Request() req: any) {
    return this.dailiesService.create(createDailyDto, req.user.userId);
  }

  @Get()
  @RequirePermissions('collab.dailies.view')
  @ApiOperation({ summary: 'Lấy danh sách daily reports theo project và date' })
  @ApiResponse({ status: 200, description: 'Danh sách daily reports' })
  findAll(
    @Query('projectId', ParseUUIDPipe) projectId: string,
    @Query('date') date?: string,
    @Request() req?: any,
  ) {
    return this.dailiesService.findAll(projectId, req.user.userId, date);
  }

  @Get('my')
  @RequirePermissions('collab.dailies.view')
  @ApiOperation({ summary: 'Lấy daily reports của user hiện tại' })
  @ApiResponse({ status: 200, description: 'Daily reports của user' })
  findMy(
    @Query('date') date?: string,
    @Query('projectId') projectId?: string,
    @Request() req?: any,
  ) {
    return this.dailiesService.findByUser(req.user.userId, date, projectId);
  }

  @Get(':id')
  @RequirePermissions('collab.dailies.view')
  @ApiOperation({ summary: 'Lấy chi tiết daily report' })
  @ApiResponse({ status: 200, description: 'Chi tiết daily report' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.dailiesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @RequirePermissions('collab.dailies.update')
  @ApiOperation({ summary: 'Cập nhật daily report' })
  @ApiResponse({ status: 200, description: 'Daily report được cập nhật thành công' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDailyDto: UpdateDailyDto,
    @Request() req: any,
  ) {
    return this.dailiesService.update(id, updateDailyDto, req.user.userId);
  }
}
