export interface AppResponse {
  type: string;
  statusCode: number;
  message: string;
  isSuccess: boolean;
  details: Record<string, unknown> | null;
}
