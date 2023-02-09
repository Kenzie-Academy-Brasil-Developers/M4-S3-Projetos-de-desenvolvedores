import { QueryResult } from 'pg';

// DEVELOPER_INFOS INTERFACES
export interface IDeveloperInfosRequest {
  developerSince: string;
  preferredOs: string;
}

export interface IDeveloperInfos extends IDeveloperInfosRequest {
  id: number;
}

export type DeveloperInfosResult = QueryResult<IDeveloperInfos>;

// DEVELOPER INTERFACES

export interface IDeveloperRequest {
  name: string;
  email: string;
}

export interface IDeveloper extends IDeveloperRequest {
  id: number;
  developerInfoId?: number;
}

export type DeveloperResult = QueryResult<IDeveloper>;
