import logger from "src/utils/logger";

export class HttpException extends Error {
  public status: number;
  public message: string;
  constructor(errCode: number, message: any) {
    super(message)
    this.status = errCode
    this.message = message || 'Unknown Error';
    logger.info(`HttpException: code: ${errCode}, message: ${message}`);
  }
}

export default HttpException;