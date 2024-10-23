export const ErrorTypes = {
  Validation: 'VALIDATION_ERROR',
  Unauthorized: 'UNAUTHORIZED_ERROR',
  BadRequest: 'BAD_REQUEST_ERROR',
  UnprocessableEntity: 'UNPROCESSABLE_ENTITY_ERROR',
  NotFound: 'ENTITY_NOT_FOUND',
};

export const SpecificErrorTypes = {
  Unauthorized: {
    CookiesUndefined: 'COOKIES_UNDEFINED',
    AccessTokenUndefined: 'ACCESS_TOKEN_UNDEFINED',
    TokenUnprocessable: 'TOKEN_UNPROCESSABLE',
    UserNotFound: 'USER_NOT_FOUND',
  },
};
