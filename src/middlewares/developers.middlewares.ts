import { NextFunction, Request, Response } from 'express';
import { Client, QueryConfig } from 'pg';
import { client } from '../database';

export const verifyDeveloperExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const developerId: number = parseInt(request.params.id);

  const queryString: string = `
  SELECT
  COUNT(*)
  FROM
    developers
  WHERE
    id = $1;`;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developerId],
  };

  const queryResult = await client.query(queryConfig);

  if (Number(queryResult.rows[0].count) > 0) {
    return next();
  }

  return response.status(404).json({
    message: 'Developer doesn`t exist',
  });
};

export const verifyDeveloperInfoExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const developerId: number = parseInt(request.params.id);

  const queryString: string = `
  SELECT
  COUNT(*)
  FROM
    developer_infos
  WHERE
    id = $1;`;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developerId],
  };

  const queryResult = await client.query(queryConfig);

  if (Number(queryResult.rows[0].count) > 0) {
    return next();
  }

  return response.status(404).json({
    message: 'Developer info doesn`t exist',
  });
};
