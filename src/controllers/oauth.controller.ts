import { NextFunction, Request, Response } from 'express';
import http from 'http';
import OauthService from '../services/oauth.service';
import querystring from 'querystring';
import { apiErrorHandler } from '../handlers/errorHandler';

const oauthService: OauthService = new OauthService();

export default class OauthController {
  getAuthorization(req: Request, res: Response, next: NextFunction) {
    try {
      const { response_type, client_id, redirect_uri, state } = req.query;
      oauthService.getAuthorization(
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
      oauthService.getToken(
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

  process(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.query;
      if (!code) res.status(400).send('Authorization code missing');
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
                message: 'Access token received',
                data: JSON.parse(data),
              });
            })
            .on('error', (error) => {
              console.error(error);
            });
        }
      );

      myReq.write(
        querystring.stringify({
          grant_type: 'authorization_code',
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
