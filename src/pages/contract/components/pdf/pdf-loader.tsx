import React, { Component } from "react";

import type { PDFDocumentProxy } from "vendor/pdfjs-dist";
import { getDocument, GlobalWorkerOptions } from "vendor/pdfjs-dist/legacy/build/pdf";
import "vendor/pdfjs-dist/web/AnnotationLayer.css";
import "vendor/pdfjs-dist/web/TextLayer.css";
interface Props {
  /** See `GlobalWorkerOptionsType`. */
  workerSrc?: string;

  url: string;
  beforeLoad: JSX.Element;
  errorMessage?: JSX.Element;
  children: (pdfDocument: PDFDocumentProxy) => JSX.Element;
  onError?: (error: Error) => void;
  cMapUrl?: string;
  cMapPacked?: boolean;
  onloadSuccess?: (document: any) => void;
  loadingState: boolean;
}

interface State {
  pdfDocument: PDFDocumentProxy | null;
  error: Error | null;
}

class PdfLoader extends Component<Props, State> {
  state: State = {
    pdfDocument: null,
    error: null,
  };

  static defaultProps = {
    loadingState: false,
  };

  documentRef = React.createRef<HTMLElement>();

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    const { pdfDocument: discardedDocument } = this.state;
    if (discardedDocument) {
      discardedDocument.destroy();
    }
  }

  componentDidUpdate({ url }: Props) {
    if (this.props.url !== url) {
      this.load();
    }
  }

  componentDidCatch(error: Error) {
    const { onError } = this.props;

    if (onError) {
      onError(error);
    }

    this.setState({ pdfDocument: null, error });
  }

  load() {
    const { ownerDocument = document } = this.documentRef.current || {};
    const { url, cMapUrl, cMapPacked } = this.props;
    const { pdfDocument: discardedDocument } = this.state;
    this.setState({ pdfDocument: null, error: null });

    GlobalWorkerOptions.workerSrc = new URL(
      "vendor/pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();

    Promise.resolve()
      .then(() => discardedDocument && discardedDocument.destroy())
      .then(() => {
        if (!url) {
          return;
        }

        return getDocument({
          ...this.props,
          ownerDocument,
          cMapUrl,
          cMapPacked,
        })
          .promise.then((pdfDocument: any) => {
            this.props.onloadSuccess && this.props.onloadSuccess(pdfDocument);
            this.setState({ pdfDocument });
          })
          .catch((error: any) => {
            this.setState({ error });
          });
      })
      .catch((e) => this.componentDidCatch(e));
  }

  render() {
    const { children, beforeLoad, loadingState } = this.props;
    const { pdfDocument, error } = this.state;
    return (
      <>
        {loadingState ? (
          beforeLoad
        ) : (
          <>
            <span ref={this.documentRef} />
            {error
              ? this.renderError()
              : !pdfDocument || !children
                ? loadingState && beforeLoad
                : children(pdfDocument)}
          </>
        )}
      </>
    );
  }

  renderError() {
    const { errorMessage } = this.props;
    if (errorMessage) {
      return React.cloneElement(errorMessage, { error: this.state.error });
    }
    return null;
  }
}

export default PdfLoader;
