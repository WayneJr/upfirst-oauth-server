import { Router } from 'express';
import OauthController from '../controllers/oauth.controller';

const oauthController = new OauthController();

class OauthRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.route('/authorize').get(oauthController.getAuthorization);
    this.router.route('/token').post(oauthController.getToken);
    this.router.route('/refresh').post(oauthController.refreshAccessToken);
  }
}

export default new OauthRoutes().router;
