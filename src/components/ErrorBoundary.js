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

    // Reset the error state after a brief moment so the boundary can catch future errors
    setTimeout(() => {
      this.setState({ hasError: false });
    }, 100);
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
    // Override fetch to catch all network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          let errorMessage = `Request failed with status ${response.status}`;
          if (response.status === 429) {
            errorMessage = 'Too many requests. Please try again later.';
          } else if (response.status >= 500) {
            errorMessage = 'External server error. Please try again later.';
          } else if (response.status >= 400) {
            if (args[0]?.includes('/iiif/2')) {
              // A common Error caused by Image api cache, pretend nothing happens
              console.log("Hide a trivial error.");
              return;
            } else {
              errorMessage = 'Request failed, please try again later';
            }
          }
          
          setError(errorMessage);
        }
        return response;
      } catch (error) {
        setError('Network error. Please check your connection.');
        throw error;
      }
    };

    const handleError = (event) => {
      console.log('Window error caught:', event.error);
      setError(event.error?.message || 'Something went wrong');
    };

    const handleRejection = (event) => {
      console.log('Unhandled promise rejection:', event.reason);
      
      let errorMessage = 'Something went wrong';
      
      // Handle different types of network errors
      if (event.reason?.status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (event.reason?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (event.reason?.status >= 400) {
        errorMessage = 'Request failed. Please check your input.';
      } else if (event.reason?.message) {
        errorMessage = event.reason.message;
      } else if (typeof event.reason === 'string') {
        errorMessage = event.reason;
      }
      
      setError(errorMessage);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.fetch = originalFetch; // Restore original fetch
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [setError]);

  return <ErrorBoundary setError={setError}>{children}</ErrorBoundary>;
}