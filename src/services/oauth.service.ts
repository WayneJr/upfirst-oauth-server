import { randomBytes } from 'crypto';
import { Response } from 'express';
import { jwtVerify, SignJWT } from 'jose';
import { AccessTokenResponse } from '../interfaces/oauth.interface';

const CLIENT_ID = 'upfirst';
const REDIRECT_URI = 'http://localhost:8081/process';
const SECRET_KEY = randomBytes(32);
const TOKEN_EXPIRATION = '1h';
const REFRESH_TOKEN_EXPIRATION = '7d';
const AUTH_CODES = new Map<string, string>(); // Map Auth Codes -> Client Ids
// const REFRESH_TOKENS = new Map<string, string>(); // Map Refresh Token -> Client Ids

AUTH_CODES.set('TEST_CODE', CLIENT_ID); // Add a code for testing
AUTH_CODES.set('TEST_CODE1', CLIENT_ID); // Add a code for testing
// REFRESH_TOKENS.set(
//   'eyJhbGciOiJIUzI1NiJ9.eyJ0b2tlbiI6IlRFU1RfVE9LRU4iLCJleHAiOjE3Mzk2MjkxMjJ9.svT0p8s4KeWpUaXn2D9bPgcvD8SQbptpZwHyu9PvEYc',
//   CLIENT_ID
// ); // Add Test Refresh token

export default class OauthService {
  // REFRESH_TOKENS;
  constructor() {
    // REFRESH_TOKENS = new Map<string, string>();
  }

  getAuthorization(
    response_type: string,
    client_id: string,
    redirect_uri: string,
    state: string,
    res: Response
  ) {
    if (
      response_type !== 'code' ||
      client_id !== CLIENT_ID ||
      redirect_uri !== REDIRECT_URI
    ) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }
    const authCode = randomBytes(16).toString('hex');
    AUTH_CODES.set(authCode, client_id);
    let redirectUrl = `${redirect_uri}?code=${authCode}`;
    if (state) {
      redirectUrl += `&state=${state}`;
    }
    return res.redirect(302, redirectUrl);
  }

  async getToken(
    grant_type: string,
    client_id: string,
    code: string,
    redirect_uri: string,
    res: Response
  ): Promise<
    Response<AccessTokenResponse, Record<string, AccessTokenResponse>>
  > {
    if (
      (grant_type !== 'authorization_code' && grant_type !== 'refresh_token') ||
      client_id !== CLIENT_ID ||
      redirect_uri !== REDIRECT_URI ||
      !code
    ) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    if (!AUTH_CODES.has(code)) {
      return res.status(400).json({ error: 'Auth code does not exist' });
    }
    const clientId = AUTH_CODES.get(code);
    if (!clientId) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    AUTH_CODES.delete(code);
    const accessToken = await this.signToken({ clientId }, TOKEN_EXPIRATION);

    if (grant_type == 'refresh_token') {
      // if it's a refresh token request return only the refresh token
      // let refreshToken: string;
      const refreshToken = await this.signToken(
        { clientId },
        REFRESH_TOKEN_EXPIRATION
      );

      return res.status(200).json({
        message: 'Access Token Retrieved Successfully',
        data: {
          access_token: accessToken,
          token_type: 'Bearer',
          expires_in: TOKEN_EXPIRATION,
          refresh_token: refreshToken,
        },
      });
    }
    return res.status(200).json({
      message: 'Access Token Retrieved Successfully',
      data: {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: TOKEN_EXPIRATION,
      },
    });
  }

  async refreshAccessToken(
    refreshToken: string,
    res: Response
  ): Promise<
    Response<AccessTokenResponse, Record<string, AccessTokenResponse>>
  > {
    try {
      void (await jwtVerify(refreshToken, SECRET_KEY)); // verify the refresh token
    } catch (error) {
      // return res.status(401).json({ message: 'Invalid refresh token' });
      // Check if response was already sent
      return res.status(401).json({ error: 'Invalid refresh token' });

      // throw new Error('Token verification failed');
    }

    // const clientId = REFRESH_TOKENS.get(refreshToken) as string;

    // Issue a new access token
    const newAccessToken = await this.signToken(
      { client_id: CLIENT_ID },
      TOKEN_EXPIRATION
    );

    return res.status(200).json({
      message: 'Access Token Refreshed',
      data: {
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: TOKEN_EXPIRATION, // 1 hour
        refresh_token: refreshToken,
      },
    });
  }

  // refreshTokenExists(clientId: string): boolean {
  //   return Array.from(REFRESH_TOKENS.values()).includes(clientId);
  // }

  // getRefreshToken(clientId: string): string {
  //   return Array.from(REFRESH_TOKENS.entries())
  //     .filter(([_, client]) => client === clientId)
  //     .map(([token]) => token)[0];
  // }

  async signToken(value: any, expiry: string): Promise<string> {
    const token = await new SignJWT(value)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(expiry)
      .sign(SECRET_KEY);
    return token;
  }
}
