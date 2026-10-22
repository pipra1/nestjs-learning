import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { LoggerMiddleware } from './common/logger.middleware.js';
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module.js';
import { UsersService } from './users/users.service.js';
import { UsersModule } from './users/users.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService, UsersService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AppController)
  }
}
