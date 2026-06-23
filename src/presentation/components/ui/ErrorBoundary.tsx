"use client";

import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; message: string; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "var(--ab-muted)",
            border: "1px solid var(--ab-line)",
            borderRadius: "var(--ab-radius)",
            margin: "2rem 0",
          }}
        >
          <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Something went wrong.</p>
          <p style={{ fontSize: "0.82rem" }}>{this.state.message}</p>
          <button
            className="ab-btn ab-btn--ghost mt-3"
            onClick={() => this.setState({ hasError: false, message: "" })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
