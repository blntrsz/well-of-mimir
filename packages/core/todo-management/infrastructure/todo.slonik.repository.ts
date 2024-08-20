import { SlonikBaseRepository } from "../../common/adapters/slonik.base-repository.adapter";
import { Todo } from "../domain/todo";

export class TodoRepository
  extends SlonikBaseRepository<Todo>
  implements TodoRepository { }

