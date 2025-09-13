import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MonitorsService } from './monitors.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';

@ApiTags('Monitors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('monitors')
export class MonitorsController {
  constructor(private readonly monitorsService: MonitorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new monitor' })
  @ApiResponse({ status: 201, description: 'Monitor successfully created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createMonitorDto: CreateMonitorDto, @Request() req) {
    return this.monitorsService.create(createMonitorDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all monitors for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of monitors' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req) {
    return this.monitorsService.findAll(req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a monitor' })
  @ApiResponse({ status: 200, description: 'Monitor updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateMonitorDto: UpdateMonitorDto,
    @Request() req,
  ) {
    const userId = req.user.sub;
    return this.monitorsService.update(id, updateMonitorDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a monitor' })
  @ApiResponse({ status: 200, description: 'Monitor deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Monitor not found' })
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    await this.monitorsService.remove(id, userId);
    return { message: 'Monitor deleted successfully' };
  }
}
