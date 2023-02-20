import { Request, Response } from 'express';
import format from 'pg-format';
import {
  IProjectRequest,
  IProjectTechRequest,
  ProjectRequiredKeys,
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
    const projectData: IProjectRequest = {
      name: req.body.name,
      description: req.body.description,
      estimatedTime: req.body.estimatedTime,
      repository: req.body.repository,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      developerId: req.body.developerId,
    };

    const requiredKeys = Object.entries(projectData);
    const keys = requiredKeys.filter((e: any) => e[1] === undefined);
    keys.splice(
      keys.findIndex((e: any) => e[0] === 'endDate'),
      1
    );
    if (keys.length > 0) {
      const message: any[] = [];
      keys.forEach((e: any) => message.push(e[0]));
      return res.status(400).json({
        message: `There are missing keys: ${message} `,
      });
    }

    const queryString: string = format(
      `
          INSERT INTO
            projects (%I) 
          VALUES (%L)
          RETURNING *;
      `,
      Object.keys(projectData),
      Object.values(projectData)
    );

    const queryResult: ProjectResult = await client.query(queryString);
    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (
      error.message.includes(
        'insert or update on table "projects" violates foreign key constraint "projects_developerId_fkey"'
      )
    ) {
      return res.status(404).json({
        message: 'Developer Not Found',
      });
    }
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
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

    if (
      req.body.name != 'Javascript' &&
      req.body.name != 'Python' &&
      req.body.name != 'React' &&
      req.body.name != 'Express.js' &&
      req.body.name != 'HTML' &&
      req.body.name != 'CSS ' &&
      req.body.name != 'Django' &&
      req.body.name != 'PostgreSQL' &&
      req.body.name != 'MongoDB'
    ) {
      return res.status(400).json({
        message: 'Invalid Tech option.',
        options: [
          'Javascript',
          'Python',
          'React',
          'Express.js',
          'HTML',
          'CSS',
          'Django',
          'PostgreSQL',
          'MongoDB',
        ],
      });
    }

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
    if (error instanceof Error) {
      res.status(400).json({
        message: error.message,
      });
    }
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
    const data: IProjectRequest = {
      name: req.body.name,
      description: req.body.description,
      estimatedTime: req.body.estimatedTime,
      repository: req.body.repository,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      developerId: req.body.developerId,
    };

    if (req.body.name) {
      data.name = req.body.name;
    }
    if (req.body.description) {
      data.description = req.body.description;
    }

    if (req.body.estimatedTime) {
      data.estimatedTime = req.body.estimatedTime;
    }
    if (req.body.repository) {
      data.repository = req.body.repository;
    }

    if (req.body.startDate) {
      data.startDate = req.body.startDate;
    }
    if (req.body.endDate) {
      data.endDate = req.body.endDate;
    }

    if (req.body.developerId) {
      data.developerId = req.body.developerId;
    }

    if (data.name === undefined) {
      delete data.name;
    }
    if (data.description === undefined) {
      delete data.description;
    }

    if (data.estimatedTime === undefined) {
      delete data.estimatedTime;
    }
    if (data.repository === undefined) {
      delete data.repository;
    }

    if (data.startDate === undefined) {
      delete data.startDate;
    }

    if (data.endDate === undefined) {
      delete data.endDate;
    }

    if (data.developerId === undefined) {
      delete data.developerId;
    }

    if (Object.keys(data).length < 1) {
      return res.status(400).json({
        message: 'At least one of those keys must be send.',
        keys: [
          'name',
          'description',
          'estimatedTime',
          'repository',
          'startDate',
          'endDate',
          'developerId',
        ],
      });
    }

    const projectId: number = parseInt(req.params.id);
    const developerData = Object.values(data);
    const developerKeys = Object.keys(data);

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
    if (
      error.message.includes(
        'insert or update on table "projects" violates foreign key constraint "projects_developerId_fkey"'
      )
    ) {
      return res.status(400).json({
        message: 'Developer not found',
      });
    }
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }
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
  const techName: string = req.params.techname;

  const queryString: string = `
  SELECT
  *
  FROM
  technologies
  WHERE
  name = $1
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [techName],
  };

  const string: string = `
  DELETE 
  technologyId
  FROM
    projects_tecnologies
  WHERE
    projectId = $1;
  `;

  const config: QueryConfig = {
    text: queryString,
    values: [projectId],
  };

  await client.query(config);
  return res.status(204).json();
};
