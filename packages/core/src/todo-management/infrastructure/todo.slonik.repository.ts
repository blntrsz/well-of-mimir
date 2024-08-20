import { SlonikBaseRepository } from "@well-of-mimir/core/common/adapters/slonik.base-repository.adapter";
import { Todo } from "@well-of-mimir/core/todo-management/domain/todo";

export class TodoRepository
  extends SlonikBaseRepository<Todo>
  implements TodoRepository {}
