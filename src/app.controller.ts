import { Controller, Get, Param, ParseIntPipe, UseGuards, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service.js';
import { DemoKeyGuard } from './common/demo-key.guard.js';
import { TimingInterceptor } from './common/timing.interceptor.js';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('demo/:id')
  @UseGuards(DemoKeyGuard)
  @UseInterceptors(TimingInterceptor)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appService.findOne(id);
  }

  @Get()
  @UseInterceptors(TimingInterceptor)
  x() {
    return "Hello World!";
  }
}
