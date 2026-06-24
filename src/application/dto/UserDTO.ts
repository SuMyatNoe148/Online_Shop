/**
 * UserDTO — Data Transfer Object for auth responses.
 * Matches the shape the frontend already expects ({ id, name, role }).
 */
export interface UserDTO {
  id: string;
  name: string;
  role: "customer" | "admin";
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
