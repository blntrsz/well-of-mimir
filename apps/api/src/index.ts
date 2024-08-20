import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { app as getOne } from "./application/get-one-todo-by-id.action.js";

const app = new Hono();

app.route("", getOne)


export const handler = handle(app);
