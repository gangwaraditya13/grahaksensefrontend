import { AxiosError } from 'axios';
import { toast } from 'sonner';

export interface ApiErrorPayload {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export function handleApiError(error: unknown): ApiErrorPayload {
  if (error instanceof AxiosError) {
    const status = error.response?.status || 0;
    const responseData = error.response?.data;

    let message = 'An unexpected error occurred. Please try again.';

    if (responseData && typeof responseData === 'object') {
      if ('message' in responseData && typeof responseData.message === 'string') {
        message = responseData.message;
      } else if ('error' in responseData && typeof responseData.error === 'string') {
        message = responseData.error;
      }
    } else if (typeof responseData === 'string' && responseData.trim()) {
      message = responseData;
    }

    switch (status) {
      case 400:
        toast.error('Validation Error', {
          description: message || 'Please check your inputs and try again.',
        });
        break;

      case 401:
        // Handled silently or with login prompt; token refresh might intercept
        break;

      case 403:
        toast.error('Access Denied', {
          description: message || 'You do not have permission to perform this action.',
        });
        break;

      case 404:
        toast.error('Not Found', {
          description: message || 'The requested resource was not found.',
        });
        break;

      case 413:
        toast.error('File Too Large', {
          description: 'The uploaded file exceeds the 2 MB size limit.',
        });
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        toast.error('Server Notice', {
          description: 'Our backend is taking a moment to respond. If this is a cold start, it will resume shortly.',
        });
        break;

      default:
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          toast.warning('Request Timed Out', {
            description: 'The server took too long to reply. Retrying or waking up...',
          });
        } else if (!error.response) {
          toast.error('Network Error', {
            description: 'Unable to connect to the GrahakSense server. Please check your internet connection.',
          });
        } else {
          toast.error('Error', { description: message });
        }
        break;
    }

    return {
      message,
      statusCode: status,
      errors: responseData?.errors,
    };
  }

  const genericMsg = (error as Error)?.message || 'Something went wrong';
  toast.error('Error', { description: genericMsg });
  return {
    message: genericMsg,
    statusCode: 0,
  };
}
