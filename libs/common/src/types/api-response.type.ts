export type SuccessResponse<T = any> = {
  error: false;
  data: T;
  message?: string;
};

export class FailureResponse extends Error {
  name: string;
  error: true;
  message: string;
  stack?: string;
}

export type APIResponse<T> = SuccessResponse<T> | FailureResponse;
