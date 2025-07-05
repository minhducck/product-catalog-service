import {
  APIResponse,
  FailureResponse,
  SuccessResponse,
} from '@common/common/types/api-response.type';

export const initApiResponse = async <TResult = any>(
  data: Promise<TResult> | TResult,
  message?: string,
): Promise<APIResponse<TResult>> => {
  try {
    return {
      error: false,
      data,
      message,
    } as SuccessResponse<TResult>;
  } catch (e: unknown) {
    return new FailureResponse((e as Error).message, {
      cause: (e as Error).cause,
    });
  }
};
