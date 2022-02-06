export class ErrorException extends Error {
  public status: number;
  public metaData: any = null;
  constructor(message: string, status: number, metaData: any = null) {
    super(message);
    this.status = status;
    this.metaData = metaData;

    Error.captureStackTrace(this, this.constructor);
  }
}
