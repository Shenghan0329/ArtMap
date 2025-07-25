// components/ErrorBoundary.js
'use client';

import React, { useContext, useEffect } from 'react';
import { ErrorContext } from "@/app/page";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Trigger the popup
    this.props.setError(
      error.message || 'Something went wrong',
    );

    // // Reset the error state after a brief moment so the boundary can catch future errors
    // setTimeout(() => {
    //   this.setState({ hasError: false });
    // }, 100);
  }

  render() {
    if (this.state.hasError) {
      // Return the children anyway, but the error has been caught and popup triggered
      return this.props.children;
    }

    return this.props.children;
  }
}

// Wrapper to connect to your ErrorContext
export function GlobalErrorBoundary({ children }) {
  const { setError } = useContext(ErrorContext);

  // Add window error listeners to catch console errors and async errors
  useEffect(() => {
    const handleError = (event) => {
      console.log('Window error caught:', event.error);
      setError(error.message || 'Something went wrong');
    };

    const handleRejection = (event) => {
      console.log('Unhandled promise rejection:', event.reason);
      setError(error.message || 'Something went wrong');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [setError]);

  return <ErrorBoundary setError={setError}>{children}</ErrorBoundary>;
}