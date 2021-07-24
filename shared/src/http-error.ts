import { StatusCodes, getReasonPhrase } from 'http-status-codes';

export class HttpError extends Error {
  constructor(public statusCode: StatusCodes, message?: string) {
    super(message || getReasonPhrase(statusCode));
  }
}
