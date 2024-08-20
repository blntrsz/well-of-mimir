import { BaseRepository } from "../ports/base-repository.port";

export class SlonikBaseRepository<TEntity> implements BaseRepository<TEntity> {
  getOneById(id: string): Promise<TEntity> {
    throw new Error("Method not implemented.");
  }
  getManyPaginated(): Promise<TEntity[]> {
    throw new Error("Method not implemented.");
  }
  create(entity: TEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  update(entity: TEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteById(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
