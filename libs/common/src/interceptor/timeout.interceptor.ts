import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import {
  catchError,
  Observable,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';
import { ConfigService } from '@nestjs/config';

const DEFAULT_REQUEST_TIMEOUT = 30_000;

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const duration = +this.configService.get<number>(
      'REQUEST_TIMEOUT',
      DEFAULT_REQUEST_TIMEOUT,
    );

    return next.handle().pipe(
      timeout(duration),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}
