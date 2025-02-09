import { Router } from 'express';
import OauthController from '../controllers/oauth.controller';
import { validateFields } from '../middleware/requests.validator';
import {
  CLIENT_ID,
  CODE,
  GRANT_TYPE,
  REDIRECT_URI,
  REFRESH_TOKEN,
  RESPONSE_TYPE,
} from '../util/constants';

const oauthController = new OauthController();

class OauthRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.get(
      '/authorize',
      validateFields('query', [RESPONSE_TYPE, CLIENT_ID, REDIRECT_URI]),
      oauthController.getAuthorization
    );
    this.router.post(
      '/token',
      validateFields('body', [GRANT_TYPE, CLIENT_ID, REDIRECT_URI, CODE]),
      oauthController.getToken
    );
    this.router.post(
      '/refresh',
      validateFields('body', [REFRESH_TOKEN]),
      oauthController.refreshAccessToken
    );
  }
}

export default new OauthRoutes().router;
