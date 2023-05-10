export interface RegisterUserDTO {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}
