import request from 'supertest';
import { app, server } from './server';

describe('OAuth 2.0 API', () => {
  afterAll(() => {
    server.close();
  });

  /**
   * Test Authorization Endpoint (Without state)
   */
  it('should redirect with a code when valid parameters are provided', async () => {
    const response = await request(app).get('/api/oauth/authorize').query({
      response_type: 'code',
      client_id: 'upfirst',
      redirect_uri: 'http://localhost:8081/process',
      state: 'SOME_STATE',
    });

    expect(response.status).toBe(302); // Expect redirection
    expect(response.headers.location).toMatch(
      /http:\/\/localhost:8081\/process\?code=\w+/
    );
    expect(response.headers.location).toContain('state=SOME_STATE'); // If state is supported
  });

  /**
   * Test Authorization Endpoint (With State)
   */
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

  /**
   * Test Token Endpoint (Valid Code)
   */
  it('should return access token when a valid authorization code is provided', async () => {
    const validAuthCode = 'TEST_CODE'; // You might need to generate a mock one
    const response = await request(app)
      .post('/api/oauth/token')
      .send(
        `grant_type=authorization_code&code=${validAuthCode}&client_id=upfirst&redirect_uri=http://localhost:8081/process`
      )
      .set('Content-Type', 'application/x-www-form-urlencoded');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain(
      'application/json; charset=utf-8'
    );
    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('token_type', 'Bearer');
    expect(response.body).toHaveProperty('expires_in');
  });

  /**
   * Test Token Endpoint (Invalid Code)
   */
  it('should return 400 for invalid authorization code', async () => {
    const response = await request(app)
      .post('/api/oauth/token')
      .send(
        `grant_type=authorization_code&code=INVALID_CODE&client_id=upfirst&redirect_uri=http://localhost:8081/process`
      )
      .set('Content-Type', 'application/x-www-form-urlencoded');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid code');
  });
});
