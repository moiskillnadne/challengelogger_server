const PasskeysSwagger = {
  paths: {
    '/api/protected/passkeys/generate-registration-options': {
      post: {
        summary: 'Generate options for passkey registration',
        tags: ['Passkeys'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  deviceName: {
                    type: 'string',
                    description: 'The name of the device being registered.',
                    example: 'My iPhone',
                  },
                },
                required: ['deviceName'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Registration options successfully generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    rpName: { type: 'string', example: 'My Application' },
                    rpID: { type: 'string', example: 'myapp.com' },
                    userName: { type: 'string', example: 'user@example.com' },
                    timeout: { type: 'integer', example: 60000 },
                    attestationType: { type: 'string', example: 'none' },
                    excludeCredentials: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', description: 'Credential ID' },
                          transports: {
                            type: 'array',
                            items: { type: 'string' },
                          },
                        },
                      },
                    },
                    authenticatorSelection: {
                      type: 'object',
                      properties: {
                        residentKey: { type: 'string', example: 'discouraged' },
                        userVerification: {
                          type: 'string',
                          example: 'preferred',
                        },
                      },
                    },
                    supportedAlgorithmIDs: {
                      type: 'array',
                      items: { type: 'integer', example: -7 },
                    },
                    challenge: {
                      type: 'string',
                      example: 'random-base64-encoded-challenge',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request. The property "deviceName" is required.',
          },
          401: {
            description: 'Unauthorized user',
          },
          500: {
            description: 'Internal server error',
          },
        },
      },
    },
    '/api/protected/passkeys/verify-registration': {
      post: {
        summary: 'Verify passkey registration response',
        tags: ['Passkeys'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    description: 'Credential ID',
                    example: 'cred-id-example',
                  },
                  rawId: { type: 'string', example: 'raw-id-example' },
                  response: {
                    type: 'object',
                    properties: {
                      clientDataJSON: {
                        type: 'string',
                        example: 'eyJ0eXAiOiJKV1QiLC...',
                      },
                      attestationObject: {
                        type: 'string',
                        example: 'eyJvcmlnaW4iOiJodHRwczovL2...',
                      },
                    },
                  },
                  type: { type: 'string', example: 'public-key' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Registration successfully verified' },
          400: {
            description: 'Expected challenge not found or invalid request data',
          },
          401: {
            description: 'Verification failed or registration info missing',
          },
          500: { description: 'Internal server error' },
        },
      },
    },
    '/api/protected/passkeys/': {
      get: {
        summary: 'Get user passkeys',
        tags: ['Passkeys'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'A list of user passkeys.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'abc123' },
                      deviceName: { type: 'string', example: 'Viktor iPhone' },
                      counter: { type: 'integer', example: 42 },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized user' },
          500: { description: 'Internal server error' },
        },
      },
    },
    '/api/protected/passkeys/{passkeyId}': {
      delete: {
        summary: 'Delete a user passkey',
        tags: ['Passkeys'],
        parameters: [
          {
            in: 'path',
            name: 'passkeyId',
            required: true,
            schema: { type: 'string' },
            description: 'The unique identifier of the passkey to delete.',
          },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Passkey deleted successfully' },
          401: { description: 'Unauthorized user' },
          404: { description: 'Passkey not found' },
          500: { description: 'Internal server error' },
        },
      },
    },
  },
};

module.exports = PasskeysSwagger;
