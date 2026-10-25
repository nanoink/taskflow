export type Project = {
  id: number;
  name: string;
  description: string | null;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = {
  name: string;
  description: string;
};
