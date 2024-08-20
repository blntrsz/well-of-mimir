export interface BaseRepository<TEntity> {
  getOneById(id: string): Promise<TEntity>;
  getManyPaginated(): Promise<TEntity[]>;

  create(entity: TEntity): Promise<void>;
  update(entity: TEntity): Promise<void>;
  deleteById(id: string): Promise<void>;
}
