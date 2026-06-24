export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "customer" | "admin";
  createdAt: Date;
}

/**
 * User — domain entity.
 * Holds identity + credentials for authentication.
 */
export class User {
  constructor(private props: UserProps) {}

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get email() {
    return this.props.email;
  }
  get passwordHash() {
    return this.props.passwordHash;
  }
  get role() {
    return this.props.role;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  toJSON(): UserProps {
    return { ...this.props };
  }
}
