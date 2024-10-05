import { Request, Response, NextFunction } from 'express';

import { authMiddleware, AuthorizedRequest } from './index';

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no cookies are provided', async () => {
    mockRequest = { headers: {} };

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid token',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if authToken is missing in cookies', async () => {
    mockRequest = {
      headers: { cookie: '' },
    };

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid token',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    (jwtService.verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid token',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not found', async () => {
    (jwtService.verifyToken as jest.Mock).mockReturnValue({
      email: 'test@example.com',
    });
    (UserCrudService.getUserByEmail as jest.Mock).mockResolvedValue(null);

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'User not found',
    });
    expect(mockNext).not.toHaveBeenCalled();
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
