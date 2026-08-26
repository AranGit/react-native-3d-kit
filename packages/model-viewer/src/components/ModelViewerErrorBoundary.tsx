import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError: (error: Error) => void;
  resetKey: string;
}

interface State {
  failed: boolean;
}

export class ModelViewerErrorBoundary extends Component<Props, State> {
  public override state: State = { failed: false };

  public static getDerivedStateFromError(): State {
    return { failed: true };
  }

  public override componentDidCatch(error: Error, _info: ErrorInfo): void {
    this.props.onError(error);
  }

  public override componentDidUpdate(previousProps: Props): void {
    if (this.state.failed && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  public override render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
