import { Router } from 'express';
import OauthController from '../controllers/oauth.controller';
import { validateFields } from '../middleware/requests.validator';
import { CODE } from '../util/constants';

class RootRoutes {
  router = Router();
  oauthController = new OauthController();

  constructor() {
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.get(
      '/process',
      validateFields('query', [CODE]),
      this.oauthController.process
    );
  }
}

export default new RootRoutes().router;
