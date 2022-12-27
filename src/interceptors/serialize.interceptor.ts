import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { plainToClass } from 'class-transformer'
import { UserDto } from '../users/dtos/user.dto'

export class SerializeInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, handler: CallHandler): Observable<any> {
    // Code runs before request handler
    console.log('I am running before the handler', ctx)

    return handler.handle().pipe(
      // Code runs after request handler
      map((data: any) => {
        return plainToClass(UserDto, data, {
          excludeExtraneousValues: true,
        })
      }),
    )
  }
}
