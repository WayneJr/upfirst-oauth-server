import { Application } from 'express';
import rootRouter from './root.route';
import oauthRouter from './oauth.route';

export default class Routes {
  constructor(app: Application) {
    app.use(rootRouter);
    app.use('/api/oauth', oauthRouter);
  }
}
