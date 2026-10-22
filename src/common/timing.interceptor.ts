import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap, map } from 'rxjs';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();

    const req = context.switchToHttp().getRequest();
    console.log(`Starting: ${req.method} ${req.originalUrl}`)

    return next.handle().pipe(
      tap(() => {
        console.log(`Finished in ${Date.now() - start}`);
      }),
      map((data) => ({
        success: true, 
        data,
      }))
    );
  }
}
