import { User } from '../types';

export const isAuthenticated = (user?: User): user is User => {
  return user !== undefined && !!user.id;
};
