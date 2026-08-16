import React from 'react';
import { useLocation } from 'react-router-dom';
import { Cake, RefreshCw, Home, AlertCircle } from 'lucide-react';

export class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('React ErrorBoundary Caught Error:', error, errorInfo);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location && prevProps.location && this.props.location.pathname !== prevProps.location.pathname) {
      if (this.state.hasError) {
        this.setState({ hasError: false, error: null });
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-cream-200 p-8 text-center space-y-6 animate-fadeIn">
            
            <div className="w-16 h-16 rounded-full bg-bakery-light border-2 border-bakery-caramel mx-auto flex items-center justify-center text-bakery">
              <Cake className="w-8 h-8 text-bakery-rose" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Application Error</span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-bakery-dark">
                Something Unexpected Happened
              </h1>
              <p className="text-xs text-gray-500 leading-relaxed">
                Our bakers ran into a slight glitch processing this page. Don't worry, your cart and session remain safe!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-full bg-cream-100 hover:bg-cream-200 text-bakery-dark font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <a
                href="/"
                className="flex-1 py-2.5 px-4 rounded-full bg-bakery-caramel hover:bg-bakery text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </a>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ErrorBoundary({ children }) {
  let location = null;
  try {
    location = useLocation();
  } catch (e) {
    location = null;
  }
  return (
    <ErrorBoundaryClass location={location} key={location ? location.pathname : 'default'}>
      {children}
    </ErrorBoundaryClass>
  );
}
