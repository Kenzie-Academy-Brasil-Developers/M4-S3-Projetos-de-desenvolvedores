import { NextFunction, Response, Request } from 'express';
import { QueryConfig } from 'pg';
import { client } from '../database/config';

export const verifyProjectExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const projectId: number = parseInt(request.params.id);

  const queryString: string = `
    SELECT
    COUNT(*)
    FROM
      projects
    WHERE
      id = $1;`;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId],
  };

  const queryResult = await client.query(queryConfig);

  if (Number(queryResult.rows[0].count) > 0) {
    return next();
  }

  return response.status(404).json({
    message: 'Project doesn`t exist',
  });
};
