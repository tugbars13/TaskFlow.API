import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, info) {
    console.error(error);
    console.error(info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-lg">
          <h1 className="text-headline-lg font-bold">
            Something went wrong
          </h1>

          <p className="text-on-surface-variant">
            Please refresh the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}