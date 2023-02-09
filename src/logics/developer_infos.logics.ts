import { request, Request, Response } from 'express';
import format from 'pg-format';
import {
  DeveloperInfosResult,
  DeveloperResult,
  IDeveloper,
  IDeveloperInfosRequest,
  IDeveloperRequest,
} from '../interfaces/interfaces';
import { client } from '../database';
import { QueryConfig, QueryResult } from 'pg';

export const getDevelopers = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const queryString: string = `
    
      SELECT * FROM developers
    
    `;

    const queryResult: DeveloperResult = await client.query(queryString);

    return response.status(200).json(queryResult);
  } catch (error) {
    return response.status(500);
  }
};

export const createDeveloperInfo = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const developerInfoData: IDeveloperInfosRequest = request.body;
    const developerId: string = request.params.id;

    let queryString: string = format(
      `
      INSERT INTO 
      developer_infos (%I)   
      VALUES (%L)
      RETURNING *;
      `,
      Object.keys(developerInfoData),
      Object.values(developerInfoData)
    );

    let queryResult: DeveloperInfosResult = await client.query(queryString);

    queryString = `
    UPDATE developers SET "developerInfoId" = $1 WHERE id = $2 RETURNING *;
    `;

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [queryResult.rows[0].id, developerId],
    };

    await client.query(queryConfig);

    return response.status(201).json(queryResult.rows[0]);
  } catch (error) {
    return response.status(500);
  }
};

export const createDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const developerData: IDeveloperRequest = request.body;
    const queryString: string = format(
      `
        INSERT INTO developers (%I) VALUES (%L) RETURNING *
    `,
      Object.keys(developerData),
      Object.values(developerData)
    );

    const queryResult: DeveloperResult = await client.query(queryString);
    return response.status(201).json(queryResult.rows[0]);
  } catch (error) {
    return response.status(500);
  }
};
