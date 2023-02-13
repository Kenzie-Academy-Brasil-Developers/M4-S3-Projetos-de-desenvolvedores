import { QueryResult } from 'pg';

export interface IDeveloperRequest {
  developerName: string;
  developerEmail: string;
}

export interface IDeveloperModify {
  name: string;
  email: string;
}

export interface IDeveloper extends IDeveloperRequest {
  developerID: number;
  developerInfoID?: number | null;
  developerInfoDeveloperSince?: Date | null;
  developerInfoPreferredOS?: string | null;
}

export interface IDeveloperFullInfo extends IDeveloper {
  projectID?: number;
  projectName?: string;
  projectDescription?: string;
  projectEstimatedTime?: string;
  projectRepository?: string;
  projectStartDate?: Date;
  projectEndDate?: Date;
  technologyId?: number;
  technologyName?: string;
}

export interface IDeveloperInfosRequest {
  developerSince: string;
  preferredOs: string;
}

export interface IDeveloperInfos extends IDeveloperInfosRequest {
  id: number;
}

export type DeveloperInfosResult = QueryResult<IDeveloperInfos>;
export type DeveloperResult = QueryResult<IDeveloper>;
export type DeveloperFullInfoResult = QueryResult<IDeveloperFullInfo>;
export type DeveloperRequiredKeys = 'name' | 'email';
export type DeveloperModifyResult = QueryResult<IDeveloperRequest>;
