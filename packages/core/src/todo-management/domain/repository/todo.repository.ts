import { SlonikBaseRepository } from "@well-of-mimir/core/common/adapters/slonik.base-repository.adapter";
import { Todo } from "@well-of-mimir/core/todo-management/domain/todo";

export interface TodoRepository extends SlonikBaseRepository<Todo> {}
