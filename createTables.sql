CREATE DATABASE developers_projects

CREATE TYPE OS AS ENUM ('Windows', 'Linux', 'MacOS');

CREATE TABLE developer_infos (
	"id" BIGSERIAL PRIMARY KEY,
	"developerSince" DATE NOT NULL,
	"preferredOS" OS NOT NULL
);

CREATE TABLE IF NOT EXISTS developers(
	"id" BIGSERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"email" VARCHAR(50) UNIQUE NOT NULL,
	"developerInfoId" INTEGER UNIQUE,
	FOREIGN KEY ("developerInfoId") REFERENCES developer_infos("id") ON DELETE SET NULL
);

CREATE TABLE projects (

	"id" BIGSERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"description" TEXT NOT NULL,
	"estimatedTime" VARCHAR(20) NOT NULL,
	"repository" VARCHAR(120) NOT NULL,
	"startDate" DATE NOT NULL,
	"endDate" DATE,
	"developerId" INTEGER NOT NULL,
	FOREIGN KEY ("developerId") REFERENCES developers("id") ON DELETE CASCADE
);

CREATE TABLE technologies (

	"id" BIGSERIAL PRIMARY KEY,
	"name" VARCHAR(30) NOT NULL
);

INSERT INTO technologies (name) VALUES
('Javascript'),
('Python'),
('React'),
('Express.js'),
('HTML'),
('CSS'),
('Django'),
('PostgreSQL'),
('MongoDB');

CREATE TABLE projects_technologies (

	"id" BIGSERIAL PRIMARY KEY,
	"addedIn" DATE NOT NULL,
	"projectId" INTEGER NOT NULL,
	"technologyId" INTEGER NOT NULL DEFAULT 0,
	FOREIGN KEY ("projectId") REFERENCES projects("id") ON DELETE CASCADE,
	FOREIGN KEY ("technologyId") REFERENCES technologies("id") ON DELETE DEFAULT
);