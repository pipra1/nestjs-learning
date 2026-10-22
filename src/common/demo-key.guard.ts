import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class DemoKeyGuard implements CanActivate {
  canActivate( context: ExecutionContext, ): boolean {
    const request = context.switchToHttp().getRequest();

    const apiKey = request.headers['x-demo-key'];
    if(apiKey !== 'nest-demo') {
      throw new UnauthorizedException('Invalid or missing demo-key');
    }

    return true;
  }
}
