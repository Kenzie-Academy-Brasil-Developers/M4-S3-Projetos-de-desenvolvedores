import { Request, Response } from 'express';
import format from 'pg-format';
import {
  DeveloperFullInfoResult,
  DeveloperRequiredKeys,
  DeveloperResult,
  IDeveloperRequest,
  IDeveloperInfosRequest,
  DeveloperInfosResult,
  DeveloperModifyResult,
} from '../interfaces/developers.interfaces';
import { client } from '../database';
import { QueryConfig } from 'pg';

const validateDeveloper = (payload: any): IDeveloperRequest => {
  const keys: Array<string> = Object.keys(payload);
  const requiredKeys: Array<DeveloperRequiredKeys> = ['name', 'email'];

  const containsAllRequired: boolean = requiredKeys.every((key: string) => {
    return keys.includes(key);
  });

  if (!containsAllRequired) {
    if (!keys.includes('name') && !keys.includes('email')) {
      throw new Error(`É necessário inserir os valores: Name e Email`);
    } else if (!keys.includes('name')) {
      throw new Error(`É necessário inserir o valor: Name`);
    } else if (!keys.includes('email')) {
      throw new Error(`É necessário inserir o valor: Email`);
    }
  }
  return payload;
};

export const getDevelopers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const queryString: string = `
    
    SELECT
     dev.id AS "developerID",
     dev.name AS "developerName",
     dev.email AS "developerEmail",
     di.id AS "developerInfoID",
     di."developerSince" AS "developerInfoDeveloperSince",
     di."preferredOS" AS "developerInfoPreferredOS"
    FROM
    developers dev
    LEFT JOIN
      developer_infos di ON dev."developerInfoId" = di.id;
    `;

    const queryResult: DeveloperResult = await client.query(queryString);

    return res.status(200).json(queryResult.rows);
  } catch (error) {
    return res.status(500);
  }
};

export const createDeveloper = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    let developerData: IDeveloperRequest = validateDeveloper(req.body);
    developerData = { email: req.body.email, name: req.body.name };
    const queryString: string = format(
      `
        INSERT INTO
          developers (%I) 
        VALUES (%L)
        RETURNING *;
    `,
      Object.keys(developerData),
      Object.values(developerData)
    );

    const queryResult: DeveloperResult = await client.query(queryString);
    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (
      error.message.includes(
        'duplicate key value violates unique constraint "developers_email_key"'
      )
    ) {
      return res.status(409).json({
        message: 'E-mail already exists',
      });
    } else if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const getDeveloperById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const developerId: number = parseInt(req.params.id);

  const queryString: string = `
  SELECT
  dev.id AS "developerID",
  dev.name AS "developerName",
  dev.email AS "developerEmail",
  di.id AS "developerInfoID",
  di."developerSince" AS "developerInfoDeveloperSince",
  di."preferredOS" AS "developerInfoPreferredOS"
 FROM
 developers dev
 LEFT JOIN
   developer_infos di ON dev."developerInfoId" = di.id
  WHERE
    dev.id = $1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developerId],
  };

  const queryResult: DeveloperResult = await client.query(queryConfig);

  return res.status(200).json(queryResult.rows[0]);
};

export const getDeveloperProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const developerId: number = parseInt(req.params.id);

    const queryString: string = `
    SELECT
      dev."id" AS "developerID",
      dev."name" AS "developerName",
      dev."email" AS "developerEmail",
      di."id" AS "developerInfoID",
      di."developerSince" AS "developerInfoDeveloperSince",
      di."preferredOS" AS "developerInfoPreferredOS",
      p."id" AS "projectID",
      p."name" AS "projectName",
      p."estimatedTime" AS "projectDescription",
      p."estimatedTime" AS "projectEstimatedTime",
      p."repository" AS "projectRepository",
      p."startDate" AS "projectStartDate",
      p."endDate" AS "projectEndDate",
      pt."technologyId",
      t.name AS "technologyName"
    FROM
      developers dev
    LEFT JOIN
      developer_infos di ON dev."developerInfoId" = di.id
    LEFT JOIN 
      projects p ON p."developerId" = dev.id
    LEFT JOIN
    projects_technologies pt ON p."id" = pt."projectId"
    LEFT JOIN
    technologies t ON t.id = pt."technologyId"
    WHERE
      dev.id = $1;
      `;

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [developerId],
    };

    const queryResult: DeveloperFullInfoResult = await client.query(
      queryConfig
    );

    return res.status(200).json(queryResult.rows);
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

export const deleteDeveloper = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const developerId: number = parseInt(req.params.id);

  const queryString: string = `
  DELETE FROM
    developers 
  WHERE 
    id = $1;  
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developerId],
  };

  await client.query(queryConfig);
  return res.status(204).json();
};

export const createDeveloperInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    let developerInfoData = {
      developerSince: req.body.developerSince,
      preferredOS: req.body.preferredOS,
    };

    if (
      developerInfoData.developerSince === undefined ||
      developerInfoData.preferredOS === undefined
    ) {
      return res.status(400).json({
        message: 'Missing required keys: developerSince,preferredOS.',
      });
    }

    if (
      developerInfoData.preferredOS != 'Windows' &&
      developerInfoData.preferredOS != 'Linux' &&
      developerInfoData.preferredOS != 'MacOS'
    ) {
      return res.status(400).json({
        message: 'Invalid OS option.',
        options: ['Windows', 'Linux', 'MacOS'],
      });
    }
    const developerId: string = req.params.id;

    const string: string = `
  SELECT
  dev.id AS "developerID",
  dev.name AS "developerName",
  dev.email AS "developerEmail",
  di.id AS "developerInfoID",
  di."developerSince" AS "developerInfoDeveloperSince",
  di."preferredOS" AS "developerInfoPreferredOS"
 FROM
 developers dev
 LEFT JOIN
   developer_infos di ON dev."developerInfoId" = di.id
  WHERE
    dev.id = $1;
  `;

    const config: QueryConfig = {
      text: string,
      values: [developerId],
    };

    const result: DeveloperResult = await client.query(config);

    if (result.rows[0].developerInfoID != null) {
      return res.status(400).json({
        message: 'Developer infos already exists.',
      });
    }

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
      UPDATE
        developers
      SET
        "developerInfoId" = $1
      WHERE
        id = $2
      RETURNING
        *;
      `;

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [queryResult.rows[0].id, developerId],
    };

    await client.query(queryConfig);

    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};
export const updateDeveloper = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const data: IDeveloperRequest = {
      name: '',
      email: '',
    };

    if (req.body.name) {
      data.name = req.body.name;
    }
    if (req.body.email) {
      data.email = req.body.email;
    }

    if (data.name === '') {
      delete data.name;
    }
    if (data.email === '') {
      delete data.email;
    }
    if (Object.keys(data).length < 1) {
      return res.status(400).json({
        message: 'At least one of those keys must be send.',
        keys: ['name', 'email'],
      });
    }
    const developerId: number = parseInt(req.params.id);
    const developerData = Object.values(data);
    const developerKeys = Object.keys(data);

    const queryString: string = format(
      `
    UPDATE
      developers
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
      values: [developerId],
    };

    const queryResult: DeveloperModifyResult = await client.query(queryConfig);

    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (
      error.message.includes(
        'duplicate key value violates unique constraint "developers_email_key"'
      )
    ) {
      return res.status(409).json({
        message: 'E-mail already exists',
      });
    } else if (error instanceof Error) {
      console.log(error);
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const updateDeveloperInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const data: IDeveloperInfosRequest = {
      developerSince: '',
      preferredOS: '',
    };
    if (req.body.developerSince) {
      data.developerSince = req.body.developerSince;
    }
    if (req.body.preferredOS) {
      data.preferredOS = req.body.preferredOS;
    }

    if (data.developerSince === '') {
      delete data.developerSince;
    }
    if (data.preferredOS === '') {
      delete data.preferredOS;
    }
    if (Object.keys(data).length < 1) {
      return res.status(400).json({
        message: 'At least one of those keys must be send.',
        keys: ['developerSince', 'preferredOS'],
      });
    }

    if (
      data.preferredOS &&
      data.preferredOS != 'Windows' &&
      data.preferredOS != 'Linux' &&
      data.preferredOS != 'MacOS'
    ) {
      return res.status(400).json({
        message: 'Invalid OS option.',
        options: ['Windows', 'Linux', 'MacOS'],
      });
    }
    const developerId: number = parseInt(req.params.id);
    const developerData = Object.values(data);
    const developerKeys = Object.keys(data);

    let queryString: string = `
    
      SELECT
      *
      FROM
      developers
      WHERE
      id = $1
    `;

    let queryConfig: QueryConfig = {
      text: queryString,
      values: [developerId],
    };

    const queryResult = await client.query(queryConfig);

    queryString = format(
      `
    UPDATE
      developer_infos
    SET (%I) = ROW (%L)
    WHERE
      id = $1
    RETURNING *;
    `,
      developerKeys,
      developerData
    );

    queryConfig = {
      text: queryString,
      values: [queryResult.rows[0].developerInfoId],
    };

    const result: DeveloperModifyResult = await client.query(queryConfig);

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error instanceof Error) {
      res.status(400).json(error.message);
    }
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};
