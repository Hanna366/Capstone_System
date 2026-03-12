import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught in ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', border: '2px solid red', borderRadius: '8px', backgroundColor: '#ffebee' }}>
          <h2 style={{ color: 'red' }}>React Rendering Error Detected!</h2>
          <p><strong>Error:</strong> {this.state.error?.message}</p>
          <p><strong>Component Stack:</strong></p>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <details style={{ marginTop: '10px' }}>
            <summary>Error Details</summary>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
              {this.state.error?.stack}
            </pre>
          </details>
          <p style={{ marginTop: '10px' }}>
            <button 
              onClick={() => window.location.reload()} 
              style={{ padding: '8px 16px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Refresh Page
            </button>
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
