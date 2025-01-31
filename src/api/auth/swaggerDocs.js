const AuthSwagger = {
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'User login with OTP sent to email',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          description: 'Request body for login',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'user@example.com',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User successfully created and OTP sent' },
          200: { description: 'User fetched and OTP sent' },
          422: { description: 'Invalid request data' },
          500: { description: 'Internal server error' },
        },
      },
    },
    '/api/auth/confirm-login': {
      post: {
        summary: 'Confirm user login with OTP',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          description: 'Request body to confirm login',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'user@example.com',
                  },
                  code: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          400: { description: 'Invalid OTP or expired code' },
          422: { description: 'Invalid request body' },
          500: { description: 'Internal server error' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: 'Log out the user and clear tokens',
        tags: ['Authentication'],
        requestBody: {
          required: false,
          description: 'This endpoint uses cookies to manage tokens',
        },
        responses: {
          204: { description: 'Logout successful, tokens cleared' },
          400: { description: 'Refresh token is missing or invalid' },
          500: { description: 'Internal server error' },
        },
      },
    },
    '/api/auth/refresh-token': {
      post: {
        summary: 'Refresh access token using a valid refresh token',
        tags: ['Authentication'],
        requestBody: {
          required: false,
          description: 'Refresh token is retrieved from cookies',
        },
        responses: {
          200: { description: 'Access token successfully refreshed' },
          404: { description: 'Refresh token is missing, invalid, or expired' },
          500: { description: 'Internal server error' },
        },
      },
    },
  },
};

module.exports = AuthSwagger;
