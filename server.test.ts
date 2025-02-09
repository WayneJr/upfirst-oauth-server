import request from 'supertest';
import { app, server } from './server';
import { jwtVerify } from 'jose';
import { BEARER } from './src/util/constants';

/**
 * Test Authorization Endpoint
 */
describe('GET /api/oauth/authorize', () => {
  afterAll(() => {
    server.close();
  });

  it('should redirect with a code when valid parameters are provided', async () => {
    const response = await request(app).get('/api/oauth/authorize').query({
      response_type: 'code',
      client_id: 'upfirst',
      redirect_uri: 'http://localhost:8081/process',
    });

    expect(response.status).toBe(302); // Expect redirection
    expect(response.headers.location).toMatch(
      /http:\/\/localhost:8081\/process\?code=\w+/
    );
    // expect(response.headers.location).toContain('state=SOME_STATE'); // If state is supported
  });

  // With State
  it('should redirect with a code and state when valid parameters are provided', async () => {
    const response = await request(app).get('/api/oauth/authorize').query({
      response_type: 'code',
      client_id: 'upfirst',
      redirect_uri: 'http://localhost:8081/process',
      state: 'SOME_STATE',
    });

    // Ensure a redirect happens
    expect(response.status).toBe(302);

    // Verify redirect Location header contains a generated code and state
    const location = response.headers.location;
    expect(location).toMatch(/http:\/\/localhost:8081\/process\?code=\w+/); // Ensure a code is present
    expect(location).toContain('state=SOME_STATE'); // Ensure state is present if implemented
  });
});

/**
 * Test Token Endpoint
 */

describe('POST /api/oauth/token', () => {
  const path = '/api/oauth/token';

  afterAll(() => {
    server.close();
  });

  // Valid Code
  it('should return access token when a valid authorization code is provided', async () => {
    const validAuthCode = 'TEST_CODE'; // You might need to generate a mock one
    const response = await request(app)
      .post(path)
      .send(
        `grant_type=authorization_code&code=${validAuthCode}&client_id=upfirst&redirect_uri=http://localhost:8081/process`
      )
      .set('Content-Type', 'application/x-www-form-urlencoded');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain(
      'application/json; charset=utf-8'
    );

    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('token_type', BEARER);
    expect(response.body).toHaveProperty('expires_in');
  });

  it('should return access and refresh token when grant type is refresh token and valid authorization code is provided', async () => {
    const validAuthCode = 'TEST_CODE1';
    const response = await request(app)
      .post(path)
      .send(
        `grant_type=refresh_token&code=${validAuthCode}&client_id=upfirst&redirect_uri=http://localhost:8081/process`
      )
      .set('Content-Type', 'application/x-www-form-urlencoded');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain(
      'application/json; charset=utf-8'
    );
    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('token_type', BEARER);
    expect(response.body).toHaveProperty('expires_in');
    expect(response.body).toHaveProperty('refresh_token');
  });
  // Invalid Code
  it('should return 400 for invalid authorization code', async () => {
    const response = await request(app)
      .post(path)
      .send(
        `grant_type=authorization_code&code=INVALID_CODE&client_id=upfirst&redirect_uri=http://localhost:8081/process`
      )
      .set('Content-Type', 'application/x-www-form-urlencoded');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Auth code does not exist');
  });
});

jest.mock('jose', () => {
  const actual = jest.requireActual('jose');
  return {
    ...actual,
    jwtVerify: jest.fn(), // Explicitly mock jwtVerify
  };
});

describe('POST /api/oauth/refresh', () => {
  const path = '/api/oauth/refresh';
  const validRefreshToken = 'valid-refresh-token';
  const clientId = 'client-123';

  beforeEach(() => {
    (jwtVerify as jest.Mock).mockResolvedValue({
      payload: { client_id: clientId },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetModules();
    server.close();
  });

  it('should return 401 if refresh token is missing', async () => {
    const response = await request(app).post(path).send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Missing required fields');
    expect(response.body).toHaveProperty('missingFields', ['refresh_token']);
  });

  it('should return 401 if refresh token verification fails', async () => {
    (jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    const response = await request(app)
      .post(path)
      .send({ refresh_token: validRefreshToken });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid refresh token');
  });

  it('should return an access token when you use pass a valid refresh token', async () => {
    // const validAuthCode = 'TEST_CODE'; // You might need to generate a mock one
    (jwtVerify as jest.Mock).mockResolvedValue('');
    const response = await request(app)
      .post(path)
      .send({ refresh_token: validRefreshToken })
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain(
      'application/json; charset=utf-8'
    );
    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('token_type', BEARER);
    expect(response.body).toHaveProperty('expires_in');
  });
});
