export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  name: string;
  confirmPassword: string;
};
