import z from 'zod';

import { CounterEntity } from '~/database/models/Counter';

export const CreateCounterSchema = z.object({
  name: z.string().min(1).max(100),
  counter: z.number().min(0),
});

type CreateCounterPayload = z.infer<typeof CreateCounterSchema> & {
  userId: string;
};

export class CounterCrudService {
  static async getListByUserId(userId: string) {
    return CounterEntity.findAll({ where: { userId } });
  }

  static async getOneById(counterId: string) {
    return CounterEntity.findOne({ where: { id: counterId } });
  }

  static async create(payload: CreateCounterPayload) {
    return CounterEntity.create(payload);
  }

  static async incrementCounterById(counterId: string) {
    const counter = await CounterEntity.findOne({
      where: { id: counterId },
    });

    if (!counter) {
      throw new Error(
        `[CounterCrudService] Counter with id ${counterId} not found.`,
      );
    }

    const counterJson = await counter.toJSON();

    return CounterEntity.update(
      {
        counter: counterJson.counter + 1,
      },
      {
        where: {
          id: counterId,
        },
      },
    );
  }
}
