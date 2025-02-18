import { NextFunction, Request, Response } from 'express';
import http from 'http';
import OauthService from '../services/oauth.service';
import querystring from 'querystring';
import { apiErrorHandler } from '../handlers/errorHandler';
import { REFRESH_TOKEN } from '../util/constants';

const oauthService: OauthService = new OauthService();

export default class OauthController {
  getAuthorization(req: Request, res: Response, next: NextFunction) {
    try {
      const { response_type, client_id, redirect_uri, state } = req.query;

      void oauthService.getAuthorization(
        response_type as string,
        client_id as string,
        redirect_uri as string,
        state as string,
        res
      );
    } catch (error) {
      apiErrorHandler(error, req, res, next);
    }
  }

  getToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { grant_type, code, client_id, redirect_uri } = req.body;

      void oauthService.getToken(
        grant_type as string,
        client_id as string,
        code as string,
        redirect_uri as string,
        res
      );
    } catch (error) {
      apiErrorHandler(error, req, res, next);
    }
  }

  refreshAccessToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refresh_token } = req.body;
      void oauthService.refreshAccessToken(refresh_token, res);
    } catch (error) {
      apiErrorHandler(error, req, res, next);
    }
  }

  // For testing the flow.
  process(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.query;
      let data = '';

      // Exchange code for access token
      const myReq = http.request(
        {
          hostname: 'localhost',
          port: 8081,
          path: '/api/oauth/token',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
        (response) => {
          response.on('data', (chunk) => {
            data += chunk;
          });

          response
            .on('end', () => {
              res.status(200).json({
                ...JSON.parse(data),
              });
            })
            .on('error', (error) => {
              console.error(error);
            });
        }
      );

      myReq.write(
        querystring.stringify({
          grant_type: REFRESH_TOKEN,
          client_id: 'upfirst',
          code: code as string,
          redirect_uri: 'http://localhost:8081/process',
        })
      );
      myReq.end();
    } catch (error) {
      apiErrorHandler(error, req, res, next);
    }
  }
}
