import { randomBytes } from 'crypto';
import { Response } from 'express';
import { SignJWT } from 'jose';

const CLIENT_ID = 'upfirst';
const REDIRECT_URI = 'http://localhost:8081/process';
const SECRET_KEY = randomBytes(32);
const TOKEN_EXPIRATION = '1h';

const AUTH_CODES = new Map<string, string>();

AUTH_CODES.set('TEST_CODE', CLIENT_ID); // Add a code for testing

export default class OauthService {
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
    res.redirect(302, redirectUrl);
  }

  async getToken(
    grant_type: string,
    client_id: string,
    code: string,
    redirect_uri: string,
    res: Response
  ) {
    if (
      grant_type !== 'authorization_code' ||
      client_id !== CLIENT_ID ||
      redirect_uri !== REDIRECT_URI ||
      !code
    ) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const clientId = AUTH_CODES.get(code);

    if (!clientId) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    AUTH_CODES.delete(code);

    const accessToken = await new SignJWT({ client_id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(TOKEN_EXPIRATION)
      .sign(SECRET_KEY);

    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: TOKEN_EXPIRATION,
    });
  }
}
