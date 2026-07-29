export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return { success: true, data };
}

export function errorResponse(message: string): ApiErrorResponse {
  return { success: false, message };
}
