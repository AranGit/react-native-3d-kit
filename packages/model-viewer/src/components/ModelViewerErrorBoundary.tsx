import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError: (error: Error) => void;
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

  public override render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
