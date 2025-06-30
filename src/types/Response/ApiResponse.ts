export interface ApiResponse<T = unknown> {
  statusCode: number;
  data: T;
}
