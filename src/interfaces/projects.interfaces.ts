import { QueryResult } from 'pg';

export interface IProjectRequest {
  name: string;
  description: string;
  estimatedTime: string;
  repository: string;
  startDate: Date;
  endDate?: Date;
  developerId: number;
}

export interface IProject extends IProjectRequest {
  id: number;
}

export type ProjectResult = QueryResult<IProject>;
