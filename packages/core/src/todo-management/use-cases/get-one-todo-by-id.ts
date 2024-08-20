import type { TodoRepository } from "@well-of-mimir/core/todo-management/domain/repository/todo.repository";

export class GetOneTodoById {
  constructor(
    private readonly todoRepository: TodoRepository,
    private readonly logger: any,
  ) { }

  execute(id: string) {
    try {
      return this.todoRepository.getOneById(id);
    } catch (e) {
      this.logger.error("Could not fetch Todo by id.", e);

      throw e;
    }
  }
}
