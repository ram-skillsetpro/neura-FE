import { Component } from "react";
import WarningIcon from "src/core/components/svg/warning-icon";

interface PdfErrorTypes {
  error: any;
  handleError?: () => void;
}

class PdfError extends Component<PdfErrorTypes> {
  componentDidMount(): void {
    this.props.handleError && this.props.handleError();
  }

  render() {
    const { error } = this.props;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          flexDirection: "column",
          gap: "12px",
          color: "#919191",
        }}
      >
        <div>
          <WarningIcon color="#919191" />
        </div>
        <div style={{ maxWidth: "400px", textAlign: "center", lineHeight: "24px" }}>
          {error.message}
        </div>
      </div>
    );
  }
}

export default PdfError;
