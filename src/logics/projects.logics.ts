import { Request, Response } from 'express';
import format from 'pg-format';
import {
  IProjectRequest,
  IProjectTechRequest,
  ProjectResult,
  ProjectTechResult,
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
          p.*,
          pt."technologyId",
          t."name" AS "technologyName"
        FROM 
          projects p
        LEFT JOIN
        projects_technologies pt ON pt."projectId" = p."id"
        LEFT JOIN
        technologies t ON t."id" = pt."technologyId"
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

export const createProjectTech = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const projectId: number = parseInt(req.params.id);
    const techName: string = req.body.name;

    let queryString: string = `
    SELECT
    *
    FROM
    technologies
    WHERE
    name = $1
    `;

    let queryConfig: QueryConfig = {
      text: queryString,
      values: [techName],
    };

    let queryResult = await client.query(queryConfig);

    const projectTechData: IProjectTechRequest = {
      addedIn: new Date(),
      projectId: projectId,
      technologyId: queryResult.rows[0].id,
    };

    queryString = format(
      `
        INSERT INTO
          projects_technologies (%I)
        VALUES (%L)
        RETURNING *;
        `,
      Object.keys(projectTechData),
      Object.values(projectTechData)
    );

    let result: ProjectTechResult = await client.query(queryString);

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

export const updateProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const projectId: number = parseInt(req.params.id);
    const developerData = Object.values(req.body);
    const developerKeys = Object.keys(req.body);

    const queryString: string = format(
      `
    UPDATE
      projects
    SET (%I) = ROW (%L)
    WHERE
    id = $1
    RETURNING *;
    `,
      developerKeys,
      developerData
    );

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [projectId],
    };

    const queryResult = await client.query(queryConfig);

    return res.status(200).json(queryResult.rows[0]);
  } catch (error: any) {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const deleteProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const projectId: number = parseInt(req.params.id);

  const queryString: string = `
  DELETE FROM
    projects 
  WHERE 
    id = $1;  
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId],
  };

  await client.query(queryConfig);
  return res.status(204).json();
};

export const deleteProjectTech = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const projectId: number = parseInt(req.params.id);
  const techName: string = req.params.name;

  const queryString: string = `
  DELETE FROM
    projects 
  WHERE 
    id = $1;  
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId],
  };

  await client.query(queryConfig);
  return res.status(204).json();
};
