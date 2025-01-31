const ChallengeSwagger = {
  paths: {
    '/api/protected/challenge/': {
      get: {
        summary: 'Fetch the list of challenges for the authenticated user',
        tags: ['Challenges'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'status',
            schema: {
              type: 'string',
              enum: ['ACTIVE', 'COMPLETED'],
            },
            description:
              'Filter challenges by their status (ACTIVE or COMPLETED)',
            required: false,
          },
          {
            in: 'query',
            name: 'page',
            schema: {
              type: 'integer',
              default: 1,
            },
            description: 'The page number for pagination',
            required: false,
          },
          {
            in: 'query',
            name: 'limit',
            schema: {
              type: 'integer',
              default: 20,
            },
            description: 'The number of items per page',
            required: false,
          },
        ],
        responses: {
          200: {
            description: 'Successfully fetched the list of challenges',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', example: 'CHALLENGE_LIST_FETCHED' },
                    statusCode: { type: 'integer', example: 200 },
                    message: {
                      type: 'string',
                      example: 'Challenge list fetched successfully',
                    },
                    isSuccess: { type: 'boolean', example: true },
                    details: {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          description: 'List of challenges',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: 'challenge-id' },
                              title: {
                                type: 'string',
                                example: 'Complete 5k run',
                              },
                              description: {
                                type: 'string',
                                example:
                                  'A challenge to complete a 5-kilometer run',
                              },
                              status: { type: 'string', example: 'ACTIVE' },
                              createdAt: {
                                type: 'string',
                                format: 'date-time',
                                example: '2024-01-01T12:00:00Z',
                              },
                            },
                          },
                        },
                        meta: {
                          type: 'object',
                          description: 'Pagination metadata',
                          properties: {
                            currentPage: { type: 'integer', example: 1 },
                            totalPages: { type: 'integer', example: 5 },
                            totalItems: { type: 'integer', example: 100 },
                            itemsPerPage: { type: 'integer', example: 20 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid request parameters',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', example: 'ERROR' },
                    statusCode: { type: 'integer', example: 400 },
                    message: {
                      type: 'string',
                      example: 'Invalid pagination or filter parameters',
                    },
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
  },
};

module.exports = ChallengeSwagger;
