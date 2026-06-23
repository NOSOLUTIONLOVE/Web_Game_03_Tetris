/**
 * ErrorBoundary - React 错误边界
 *
 * 捕获 TetrisGame 子树中的运行时错误，
 * 展示友好的兜底界面，并提供"重试"按钮以重置错误状态。
 */

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-8">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">游戏出错了</h2>
            <p className="text-sm text-muted-foreground">
              游戏遇到了意外错误。请尝试重新加载。
            </p>
            {this.state.error && (
              <pre className="text-xs text-left bg-secondary/60 p-3 rounded-lg overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
