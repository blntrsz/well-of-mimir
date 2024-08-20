import { Hono } from "hono";
import { GetOneTodoById } from "@well-of-mimir/core/src/todo-management";
import { TodoRepository } from "@well-of-mimir/core/src/todo-management/infrastructure/todo.slonik.repository.js";

export const app = new Hono()

app.get("/{id}", async (c) => {
  const id = c.req.param('id')

  const useCase = new GetOneTodoById(
    new TodoRepository(),
    console
  )

  return c.json(await useCase.execute(id!))
})

