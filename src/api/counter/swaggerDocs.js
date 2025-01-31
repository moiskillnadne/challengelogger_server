const CounterSwagger = {
  paths: {
    '/api/counter/create': {
      post: {
        summary: 'Create a new counter',
        description:
          'This endpoint creates a new counter for an authenticated user.',
        tags: ['Counters'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'The name of the counter',
                    example: 'My Counter',
                  },
                  value: {
                    type: 'number',
                    description: 'The initial value of the counter',
                    example: 10,
                  },
                },
                required: ['name', 'value'],
              },
            },
          },
        },
        responses: {
          201: { description: 'Counter created successfully' },
          401: { description: 'Unauthorized' },
          422: { description: 'Unprocessable Entity' },
        },
      },
    },
    '/api/counter/{counterId}': {
      get: {
        summary: 'Get a counter by ID',
        description:
          'Fetches a specific counter by its ID for an authenticated user.',
        tags: ['Counters'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'counterId',
            required: true,
            description: 'The ID of the counter to fetch',
            schema: { type: 'string', example: '12345' },
          },
        ],
        responses: {
          200: { description: 'Counter fetched successfully' },
          401: { description: 'Unauthorized' },
          404: { description: 'Counter not found' },
        },
      },
    },
    '/api/counter/': {
      get: {
        summary: 'Get a list of counters for the authenticated user',
        description:
          'Fetches all counters associated with the authenticated user’s account.',
        tags: ['Counters'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Counter list fetched successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/counter/increment/{counterId}': {
      post: {
        summary: 'Increment a counter by ID',
        description:
          'Increments the value of a specific counter for an authenticated user.',
        tags: ['Counters'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'counterId',
            required: true,
            description: 'The ID of the counter to increment',
            schema: { type: 'string', example: '12345' },
          },
        ],
        responses: {
          200: { description: 'Counter updated successfully' },
          401: { description: 'Unauthorized' },
          404: { description: 'Counter not found' },
        },
      },
    },
  },
};

module.exports = CounterSwagger;
