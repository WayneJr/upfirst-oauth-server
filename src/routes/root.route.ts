import { Router } from 'express';
import OauthController from '../controllers/oauth.controller';

class RootRoutes {
  router = Router();
  oauthController = new OauthController();

  constructor() {
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.route('/process').get(this.oauthController.process);
  }
}

export default new RootRoutes().router;
