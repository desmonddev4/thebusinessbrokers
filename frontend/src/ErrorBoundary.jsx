import { Component } from "react";
import { Link } from "react-router-dom";
import "./ErrorBoundary.css";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h1>Something went wrong</h1>
            <p>
              We encountered an unexpected error. This has been logged, and
              we're working to fix it.
            </p>
            <div className="error-boundary-actions">
              <button
                className="btn-gold"
                onClick={() => window.location.reload()}
              >
                Refresh the page
              </button>
              <Link to="/" className="btn-ghost">
                Go to homepage
              </Link>
            </div>
            {process.env.NODE_ENV === "development" && (
              <details className="error-boundary-details">
                <summary>Error details (development only)</summary>
                <pre>{this.state.error?.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
