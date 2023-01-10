import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { MessageService } from 'src/message/message.service';

// This interceptor for restructure response success
@Injectable()
export class ResponseInterceptor
  implements NestInterceptor<Promise<any> | string>
{
  constructor(private readonly messageService: MessageService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Promise<any> | string>> {
    // const ctx: HttpArgumentsHost = context.switchToHttp();
    // const responseExpress: any = ctx.getResponse();

    return next.handle().pipe(
      map(async (response: Promise<Record<string, any> | string>) => {
        // const status: number = responseExpress.statusCode;
        const data: Record<string, any> | string = await response;

        // response error must in object
        if (typeof data !== 'object') {
          throw new InternalServerErrorException(
            this.messageService.get('response.statusCode.mustInObject'),
          );
        }

        const { statusCode, ...others } = data;
        return {
          statusCode: statusCode,
          ...others,
        };
      }),
    );
  }
}
