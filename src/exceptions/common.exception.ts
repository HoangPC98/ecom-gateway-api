export class HttpException extends Error {
  public status: number;
  public message: string;
  constructor(errCode: number, message: any) {
    super(message)
    this.status = errCode
    this.message = message || 'Unknown Error';
  }
}

export default HttpException;