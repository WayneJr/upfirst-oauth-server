export interface AccessTokenResponse {
  access_token?: string;
  token_type: string;
  expires_in: string; // 1 hour
  refresh_token?: string;
}
