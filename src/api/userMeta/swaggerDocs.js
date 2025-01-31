 const UserMetaSwagger = {
  paths: {
    '/api/protected/userMeta/save': {
      post: {
        summary: 'Save user metadata',
        tags: ['userMeta'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          description: "Metadata of the user to be saved",
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  isWelcomeFlowPassed: {
                    type: 'boolean',
                    description: 'Indicates whether the user has completed the welcome flow',
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User metadata successfully saved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - User is not authenticated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', example: 'ERROR' },
                    statusCode: { type: 'integer', example: 401 },
                    message: { type: 'string', example: 'Unauthorized' },
                  },
                },
              },
            },
          },
          422: {
            description: 'Invalid data in the request body',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', example: 'ERROR' },
                    statusCode: { type: 'integer', example: 422 },
                    message: { type: 'string', example: 'Invalid data provided' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Metadata saving failed or user not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    isSuccess: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Error saving user meta' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', example: 'SERVER_ERROR' },
                    statusCode: { type: 'integer', example: 500 },
                    message: { type: 'string', example: 'Internal server error' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/protected/userMeta/': {
      get: {
        summary: 'Retrieve user metadata',
        tags: ['userMeta'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Successfully retrieved user metadata',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', description: 'Unique ID of the user metadata record', example: 'meta-id' },
                    userId: { type: 'string', description: 'ID of the user', example: 'user-id' },
                    isWelcomeFlowPassed: { type: 'boolean', description: 'Indicates whether the user has completed the welcome flow', example: true },
                    createdAt: { type: 'string', format: 'date-time', description: 'When the metadata was created', example: '2024-01-01T12:00:00Z' },
                    updatedAt: { type: 'string', format: 'date-time', description: 'When the metadata was last updated', example: '2024-01-02T12:00:00Z' },
                  },
                },
              },
            },
          },
          400: {
            description: 'User metadata does not exist',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', example: 'BAD_REQUEST' },
                    statusCode: { type: 'integer', example: 400 },
                    message: { type: 'string', example: 'User meta entity does not exist' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - User is not authenticated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', example: 'ERROR' },
                    statusCode: { type: 'integer', example: 401 },
                    message: { type: 'string', example: 'Unauthorized' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', example: 'SERVER_ERROR' },
                    statusCode: { type: 'integer', example: 500 },
                    message: { type: 'string', example: 'Internal server error' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};


module.exports = UserMetaSwagger;
