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

// Helper function to parse retry delay from response headers
function getRetryDelay(response) {
  // Check Retry-After header (standard for 429 responses)
  const retryAfter = response.headers.get('Retry-After');
  if (retryAfter) {
    // Can be in seconds (number) or HTTP date format
    const retrySeconds = parseInt(retryAfter, 10);
    if (!isNaN(retrySeconds)) {
      return retrySeconds * 1000; // Convert to milliseconds
    }
    
    // If it's a date string, calculate the difference
    const retryDate = new Date(retryAfter);
    if (!isNaN(retryDate.getTime())) {
      return Math.max(0, retryDate.getTime() - Date.now());
    }
  }
  
  // Check other common rate limit headers
  const rateLimitReset = response.headers.get('X-RateLimit-Reset');
  if (rateLimitReset) {
    const resetTime = parseInt(rateLimitReset, 10);
    if (!isNaN(resetTime)) {
      // Could be Unix timestamp or seconds from now
      const resetDate = resetTime > 1000000000 ? resetTime * 1000 : Date.now() + (resetTime * 1000);
      return Math.max(0, resetDate - Date.now());
    }
  }
  
  // Fallback: exponential backoff starting at 1 second
  return 1000;
}

// Enhanced fetch function with retry logic
async function fetchWithRetry(originalFetch, url, options = {}, maxRetries = 3, retryCount = 0) {
  try {
    const response = await originalFetch(url, options);
    
    if (response.status === 429 && retryCount < maxRetries) {
      const retryDelay = getRetryDelay(response);
      const maxDelay = 60000; // Maximum 1 minute wait
      const actualDelay = Math.min(retryDelay, maxDelay);
      
      console.log(`Rate limited. Retrying in ${actualDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      
      // Wait for the specified delay
      await new Promise(resolve => setTimeout(resolve, actualDelay));
      
      // Retry the request
      return fetchWithRetry(originalFetch, url, options, maxRetries, retryCount + 1);
    }
    
    return response;
  } catch (error) {
    // If it's a network error and we have retries left, try exponential backoff
    if (retryCount < maxRetries && (
      error.name === 'TypeError' || 
      error.message.includes('fetch') ||
      error.message.includes('network')
    )) {
      const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Cap at 10 seconds
      console.log(`Network error. Retrying in ${backoffDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      return fetchWithRetry(originalFetch, url, options, maxRetries, retryCount + 1);
    }
    
    throw error;
  }
}

// Wrapper to connect to your ErrorContext
export function GlobalErrorBoundary({ children }) {
  const { setError } = useContext(ErrorContext);

  // Add window error listeners to catch console errors and async errors
  useEffect(() => {
    // Override fetch to catch all network errors and handle retries
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const [url, options] = args;
        const response = await fetchWithRetry(originalFetch, url, options);
        
        if (!response.ok) {
          let errorMessage = `Request failed with status ${response.status}`;
          if (url?.includes('https://www.artic.edu/iiif/2')) {
            // A common Error caused by Image api cache, pretend nothing happens
            console.log("Hide a trivial error.");
            return response; // Return the response instead of undefined
          }
          if (response.status === 429) {
            // If we've exhausted retries and still getting 429
            const retryAfter = response.headers.get('Retry-After');
            errorMessage = retryAfter ? 
              `Too many requests. Please try again in ${retryAfter} seconds.` :
              'Too many requests. Please try again later.';
          } else if (response.status >= 500) {
            errorMessage = 'External server error. Please try again later.';
          } else if (response.status >= 400) {
            errorMessage = 'Request failed, please try again later';
          }
          
          setError(errorMessage);
        }
        return response;
      } catch (error) {
        // Check if this is a 429 error from our retry logic
        if (error.status === 429) {
          setError('Rate limited after retries. Please wait before trying again.');
        } else {
          setError('Network error or Server error. Please check your connection or contact admin.');
        }
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