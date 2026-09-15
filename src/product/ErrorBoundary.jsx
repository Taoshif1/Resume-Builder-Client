import { Component } from "react";
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error("PersonaCV rendering failed", error.message);
  }
  render() {
    return this.state.failed ? (
      <main className="pcv-state">
        <h1>Something went wrong</h1>
        <p>Your saved workspace remains available. Reload to try again.</p>
        <button onClick={() => window.location.reload()}>
          Reload PersonaCV
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
