import { Request, Response, NextFunction } from 'express';

import { authMiddleware, AuthorizedRequest } from './index';

import { BadRequestError, UnauthorizedError } from '~/core/errors';
import { jwtService } from '~/core/utils';
import { UserCrudService } from '~/shared/user/User.crud';

jest.mock('~/core/utils');
jest.mock('~/shared/user/User.crud');

describe('authMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {
        cookie: 'authToken=testToken',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  it('should return UnauthorizedError if no cookies are provided', async () => {
    mockRequest = { headers: {} };

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledWith(
      new UnauthorizedError('Authentication required: Cookies undefined'),
    );
    expect(mockNext).not.toHaveBeenCalledWith();
  });

  it('should return UnauthorizedError if authToken is missing in cookies', async () => {
    mockRequest = {
      headers: { cookie: '' },
    };

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledWith(
      new UnauthorizedError('Authentication required: Cookies undefined'),
    );
    expect(mockNext).not.toHaveBeenCalledWith();
  });

  it('should return BadRequestError if decoded JWT is a string', async () => {
    (jwtService.verifyToken as jest.Mock).mockReturnValue(
      'invalid-token-string',
    );

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledWith(
      new BadRequestError(
        'Authentication required: Decoded JWT is string for some reason. Decoded result is invalid-token-string',
      ),
    );
    expect(mockNext).not.toHaveBeenCalledWith();
  });

  it('should return UnauthorizedError if email is missing in decoded JWT', async () => {
    (jwtService.verifyToken as jest.Mock).mockReturnValue({});

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledWith(
      new UnauthorizedError('Authentication required: Email is undefined'),
    );
    expect(mockNext).not.toHaveBeenCalledWith();
  });

  it('should return UnauthorizedError if user is not found', async () => {
    (jwtService.verifyToken as jest.Mock).mockReturnValue({
      email: 'test@example.com',
    });
    (UserCrudService.getUserByEmail as jest.Mock).mockResolvedValue(null);

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledWith(
      new UnauthorizedError('Authentication required: User not found'),
    );
    expect(mockNext).not.toHaveBeenCalledWith();
  });

  it('should call next if token is valid and user is found', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (jwtService.verifyToken as jest.Mock).mockReturnValue({
      email: 'test@example.com',
    });
    (UserCrudService.getUserByEmail as jest.Mock).mockResolvedValue({
      toJSON: () => mockUser,
    });

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalled();
    expect((mockRequest as AuthorizedRequest).user).toEqual(mockUser);
  });
});
