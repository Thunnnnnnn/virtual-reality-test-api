import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiResponseDto } from './dto/api-response.dto';

@Injectable()
export class ResponseInterceptor<T>
    implements NestInterceptor<T, ApiResponseDto<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ApiResponseDto<T>> {
        const response = context.switchToHttp().getResponse();

        const statusCode = response.statusCode;
        return next.handle().pipe(
            map((data) => {
                return new ApiResponseDto(data, statusCode);
            }),
        );
    }
}