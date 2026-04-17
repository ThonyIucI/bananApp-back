import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error: string | null;
    meta?: {
        total: number;
        page: number;
        limit: number;
    };
}
export declare class ResponseFormatInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>>;
}
