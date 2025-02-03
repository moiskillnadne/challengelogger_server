 const UserNotificationSettingsSwagger = {
  paths: {
    '/api/protected/userNotificationSettings/': {
      get: {
        summary: 'Retrieve user notification settings',
        tags: ['userNotificationSettings'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Successfully retrieved user notification settings',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', description: 'Unique ID of the user notification settings record', example: 'notificationSettings-id' },
                    userId: { type: 'string', description: 'ID of the user', example: 'user-id' },
                    dailyReminder: { type: 'boolean', description: 'Indicates whether the user enabled daily reminder', example: true },
                    createdAt: { type: 'string', format: 'date-time', description: 'When the notification settings was created', example: '2024-01-01T12:00:00Z' },
                    updatedAt: { type: 'string', format: 'date-time', description: 'When the notification settings was last updated', example: '2024-01-02T12:00:00Z' },
                  },
                },
              },
            },
          },
          400: {
            description: 'User notification settings does not exist',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', example: 'BAD_REQUEST' },
                    statusCode: { type: 'integer', example: 400 },
                    message: { type: 'string', example: 'User notification settings entity does not exist' },
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
    '/api/protected/userNotificationSettings/save': {
      post: {
        summary: 'Save user notification settings',
        tags: ['userNotificationSettings'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          description: 'Notification settings of the user to be saved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  dailyReminder: {
                    type: 'boolean',
                    description: 'Indicates whether the user enabled daily reminder',
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User notification settings successfully saved',
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
            description: 'Notification settings saving failed or user not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    isSuccess: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Error saving user notification settings' },
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


module.exports = UserNotificationSettingsSwagger;
