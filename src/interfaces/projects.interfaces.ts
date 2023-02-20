import { QueryResult } from 'pg';

export interface IProjectRequest {
  name?: string;
  description?: string;
  estimatedTime?: string;
  repository?: string;
  startDate?: Date;
  endDate?: Date;
  developerId?: number;
}

export interface IProject extends IProjectRequest {
  id: number;
}

export interface IProjectTechRequest {
  addedIn: Date;
  projectId: Number;
  technologyId: Number;
}

export interface IProjectTech extends IProjectTechRequest {
  id: Number;
}

export type ProjectRequiredKeys =
  | 'name'
  | 'description'
  | 'estimatedTime'
  | 'repository'
  | 'startDate'
  | 'developerId';

export type ProjectResult = QueryResult<IProject>;
export type ProjectTechResult = QueryResult<IProjectTech>;
