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
} from './logics/projects.logics';

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
app.patch(
  '/developers/:id/infos',
  verifyDeveloperInfoExists,
  updateDeveloperInfo
);
///////////// projects ////////////////
app.post('/projects', createProject);
app.get('/projects', getProjects);
app.get('/projects/:id', getProjectById);

app.listen(3000, async () => {
  console.log('Server is running');
  await startDatabase();
});
