import express, { Application } from 'express';
import { startDatabase } from './database';
import {
  createDeveloper,
  deleteDeveloper,
  getDeveloperById,
  getDeveloperProjects,
  getDevelopers,
  createDeveloperInfo,
  updateDeveloper,
  updateDeveloperInfo,
} from './logics/developers.logics';
import {
  verifyDeveloperExists,
  verifyDeveloperInfoExists,
} from './middlewares/developers.middlewares';
import {
  createProject,
  getProjects,
  getProjectById,
  createProjectTech,
  updateProject,
  deleteProject,
  deleteProjectTech,
} from './logics/projects.logics';

import {
  verifyProjectExists,
  verifytechExist,
} from './middlewares/projects.middlewares';

const app: Application = express();
app.use(express.json());

//////////// developers //////////////
app.post('/developers', createDeveloper);
app.get('/developers/:id', verifyDeveloperExists, getDeveloperById);
app.get(
  '/developers/:id/projects',
  verifyDeveloperExists,
  getDeveloperProjects
);
app.get('/developers', getDevelopers);
app.patch('/developers/:id', verifyDeveloperExists, updateDeveloper);
app.delete('/developers/:id', verifyDeveloperExists, deleteDeveloper);
app.post('/developers/:id/infos', verifyDeveloperExists, createDeveloperInfo);
app.patch('/developers/:id/infos', verifyDeveloperExists, updateDeveloperInfo);
///////////// projects ////////////////
app.post('/projects', createProject);
app.get('/projects', getProjects);
app.get('/projects/:id', verifyProjectExists, getProjectById);
app.patch('/projects/:id', verifyProjectExists, updateProject);
app.delete('/projects/:id', verifyProjectExists, deleteProject);
app.post('/projects/:id/technologies', verifyProjectExists, createProjectTech);
app.delete(
  '/projects/:id/technologies/:techname',
  verifytechExist,
  verifyProjectExists,
  deleteProjectTech
);

app.listen(3000, async () => {
  console.log('Server is running');
  await startDatabase();
});
