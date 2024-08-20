export type TodoAttributes = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Todo {
  constructor(public readonly attributes: TodoAttributes) {}
}
