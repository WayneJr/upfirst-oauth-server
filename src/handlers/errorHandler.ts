import { Request, Response, NextFunction } from 'express';

export function unCaughtErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(JSON.stringify(err));
  res.end({ error: err });
}

export function apiErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }

  const errorResponse = {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  console.log(err);

  res.status(err.status || 500).json(errorResponse);
}
