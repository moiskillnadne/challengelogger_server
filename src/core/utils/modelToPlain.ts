import { Model } from 'sequelize';

/**
 * Helper function to convert Sequelize model to plain JSON
 * @param instance Sequelize model instance or array of instances
 * @returns Plain JSON object or array of objects
 */
export function modelToPlain<T>(instance: Model | Model[]): T {
  if (Array.isArray(instance)) {
    return instance.map((item) => item.get({ plain: true })) as T;
  } else {
    return instance.get({ plain: true }) as T;
  }
}
