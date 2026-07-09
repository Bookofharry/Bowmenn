import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

/**
 * Validates req.body against a zod schema. On success, req.body is replaced
 * with the parsed (trimmed/coerced) data; on failure, responds 400 with the
 * first issue.
 */
export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const issue = result.error.issues[0];
      const path = issue.path.join(".");
      res.status(400).json({
        success: false,
        message: path ? `${path}: ${issue.message}` : issue.message,
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
