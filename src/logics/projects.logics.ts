import { Request, Response } from 'express';
import format from 'pg-format';
import {
  IProjectRequest,
  ProjectResult,
} from '../interfaces/projects.interfaces';

import { client } from '../database';
import { QueryConfig } from 'pg';

export const createProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const developerData: IProjectRequest = req.body;
    const queryString: string = format(
      `
          INSERT INTO
            projects (%I) 
          VALUES (%L)
          RETURNING *;
      `,
      Object.keys(developerData),
      Object.values(developerData)
    );

    const queryResult: ProjectResult = await client.query(queryString);
    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const getProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const queryString: string = `
      
        SELECT
          * 
        FROM 
          projects;
      
      `;

    const queryResult: ProjectResult = await client.query(queryString);

    return res.status(200).json(queryResult.rows);
  } catch (error) {
    return res.status(500);
  }
};

export const getProjectById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const developerId: number = parseInt(req.params.id);

  const queryString: string = `
    SELECT
      *
    FROM
      projects
    WHERE
      id = $1;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developerId],
  };

  const queryResult: ProjectResult = await client.query(queryConfig);

  return res.status(200).json(queryResult.rows[0]);
};
