export interface ModelProps {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  instagram?: string;
  featured: boolean;
  createdAt: Date;
}

/**
 * Model — domain entity representing a brand model used to promote collections.
 */
export class Model {
  constructor(private props: ModelProps) {}

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get role() {
    return this.props.role;
  }
  get bio() {
    return this.props.bio;
  }
  get photo() {
    return this.props.photo;
  }
  get instagram() {
    return this.props.instagram;
  }
  get featured() {
    return this.props.featured;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  toJSON(): ModelProps {
    return { ...this.props };
  }
}
