// import * as dotenv from 'dotenv';
// dotenv.config();
import express from 'express';
import { Application } from 'express';

import Server from './src/index';

const app: Application = express();
new Server(app);
const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8081;

const server = app
  .listen(port, 'localhost', function () {
    console.info(`Server running on : http://localhost:${port}`);
  })
  .on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log('server startup error: address already in use');
    } else {
      console.log(err);
    }
  });

export { app, server };
