# OAuth Server

This project is an OAuth server implementation using Node.js and Express. It provides endpoints for authorization and token management.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:

```
git clone https://github.com/WayneJr/upfirst-oauth-server.git
cd upfirst-oauth-server
```

2. Install dependencies:

```
npm install
```

## Running the Server

1. Start the server

```
npm start
```

2. The server will start by default on `http://localhost:8080`

## Running the tests

1. Run the tests

```
npm test
```

## Endpoints

### Authorization

- **URL**: `/api/oauth/authorize`
- **Method**: `GET`
- **Description**: Initiates the auth process
- **Query Parameters**:
  - `response_type` (required): Must be 'code'.
  - `client_id` (required): The client ID.
  - `redirect_uri` (required): The redirect URI.
  - `state` (optional): An opaque value used to maintain state between the request and callback.

### Token Endpoint

- **URL**: `/api/oauth/token`
- **Method**: `POST`
- **Description**: Exchanges an authorization code for an access token.
- **Body Parameters**:
  - `grant_type` (required): Must be `authorization_code` or `refresh_token`.
  - `client_id` (required): The client ID.
  - `redirect_uri` (required): The redirect URI.
  - `code` (required): The authorization code received from the authorization.

### Refresh Token Endpoint

- **URL**: `/api/oauth/refresh`
- **Method**: `POST`
- **Description**: Exchanges a refresh token for an access token.
- **Body Parameters**:
  - `refresh_token` (required): The refesh token.

## Author

Uchechukwu Ahunanya

Github: WayneJr

Email: uahunanya92@gmail.com
