import express, { Application } from 'express';
import { startDatabase } from './database';
import {
  createDeveloper,
  createDeveloperInfo,
  getDevelopers,
} from './logics/developer_infos.logics';
const app: Application = express();
app.use(express.json());

app.get('/developers', getDevelopers);
app.post('/developers/:id/infos', createDeveloperInfo);
app.post('/developers', createDeveloper);

app.listen(3000, async () => {
  console.log('Server is running');
  await startDatabase();
});
