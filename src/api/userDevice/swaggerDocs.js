const UserDeviceSwagger = {
  paths: {
    '/api/protected/userDevice/save': {
      post: {
        summary: 'Save user device metadata',
        tags: ['User Device'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          description: "Metadata of the user's device",
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fingerprint: {
                    type: 'string',
                    description: 'Unique fingerprint of the device',
                    example: 'unique-device-fingerprint',
                  },
                  platform: {
                    type: 'string',
                    description: 'Operating system of the device',
                    example: 'Windows',
                  },
                  platformVersion: {
                    type: 'string',
                    description: 'Version of the operating system',
                    example: '10.0.0',
                  },
                  browser: {
                    type: 'string',
                    description: 'Browser used on the device',
                    example: 'Chrome',
                  },
                  browserVersion: {
                    type: 'string',
                    description: 'Version of the browser',
                    example: '108.0.0',
                  },
                  screenResolution: {
                    type: 'string',
                    description: 'Screen resolution of the device',
                    example: '1920x1080',
                  },
                  colorDepth: {
                    type: 'integer',
                    description: 'Color depth of the device screen',
                    example: 24,
                  },
                  pixelDepth: {
                    type: 'integer',
                    description: 'Pixel depth of the device screen',
                    example: 24,
                  },
                  webGLFingerprint: {
                    type: 'string',
                    description: 'WebGL fingerprint of the device',
                    example: 'webgl-fingerprint-example',
                  },
                  pixelRatio: {
                    type: 'number',
                    description: 'Device pixel ratio',
                    example: 2,
                  },
                  maxTouchPoints: {
                    type: 'integer',
                    description: 'Maximum touch points supported by the device',
                    example: 10,
                  },
                  isTouchScreen: {
                    type: 'boolean',
                    description: 'Indicates if the device is a touchscreen',
                    example: true,
                  },
                  canvasFingerprint: {
                    type: 'string',
                    description: 'Canvas fingerprint of the device',
                    example: 'canvas-fingerprint-example',
                  },
                  userAgent: {
                    type: 'string',
                    description: 'User agent string of the browser',
                    example: 'Mozilla/5.0 ...',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Device metadata successfully saved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { success: { type: 'boolean', example: true } },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      example: 'ERROR',
                    },
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
                    message: {
                      type: 'string',
                      example: 'Invalid data provided',
                    },
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
                    message: {
                      type: 'string',
                      example: 'Internal server error',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/protected/userDevice/': {
      get: {
        summary:
          'Retrieve a list of devices associated with the authenticated user',
        tags: ['User Device'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Successfully fetched the list of user devices',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        description: 'Unique identifier for the device',
                        example: 'device-id',
                      },
                      createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Creation timestamp',
                        example: '2024-01-01T12:00:00Z',
                      },
                      updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Last updated timestamp',
                        example: '2024-01-02T12:00:00Z',
                      },
                      platform: {
                        type: 'string',
                        description: 'Operating system',
                        example: 'Windows',
                      },
                      platformVersion: {
                        type: 'string',
                        description: 'OS Version',
                        example: '10.0.0',
                      },
                      browser: {
                        type: 'string',
                        description: 'Browser used',
                        example: 'Chrome',
                      },
                      browserVersion: {
                        type: 'string',
                        description: 'Browser version',
                        example: '108.0.0',
                      },
                      screenResolution: {
                        type: 'string',
                        description: 'Screen resolution',
                        example: '1920x1080',
                      },
                      userId: {
                        type: 'string',
                        description: 'User ID associated with the device',
                        example: 'user-id',
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          500: { description: 'Internal server error' },
        },
      },
    },
    '/api/protected/userDevice/{deviceId}': {
      delete: {
        summary: 'Delete a specific device by its ID',
        tags: ['User Device'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'deviceId',
            required: true,
            schema: { type: 'string' },
            description: 'The unique ID of the device to be deleted',
          },
        ],
        responses: {
          200: {
            description: 'Device successfully deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Device deleted successfully',
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Device not found' },
          500: { description: 'Internal server error' },
        },
      },
    },
  },
};

module.exports = UserDeviceSwagger;
