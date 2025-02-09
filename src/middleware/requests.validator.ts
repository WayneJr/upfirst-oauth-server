import { Request, Response, NextFunction } from 'express';

export const validateFields = (
  source: 'query' | 'body',
  requiredFields: string[]
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields = requiredFields.filter(
      (field) => !(field in req[source])
    );

    if (missingFields.length > 0) {
      res.status(400).json({
        error: 'Missing required fields',
        missingFields,
      });
      return; // ✅ Ensure the function stops here
    }

    next(); // ✅ Only call next() if validation passes
  };
};
