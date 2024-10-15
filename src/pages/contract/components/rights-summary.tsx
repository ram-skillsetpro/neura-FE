import React, { useState } from "react";
import DownloadIcon from "src/core/components/svg/download-icon";
import { useAppDispatch } from "src/core/hook";
import { fetchRightsSummaryDownloadData } from "../contract.redux";

interface RightsSummaryType {
  content: string;
  fileId: number;
  folderId?: number;
  teamId: number;
}

const RightsSummary: React.FC<RightsSummaryType> = ({ content, fileId, folderId, teamId }) => {
  /* Hooks */
  const dispatch = useAppDispatch();

  console.log("content", content);

  /* Local State */
  const [loading, setLoading] = useState<boolean>(false);

  /* Functions */
  const handleExport = async () => {
    setLoading(true);
    await dispatch(
      fetchRightsSummaryDownloadData({
        fileId,
        folderId,
        teamId,
      }),
    );
    setLoading(false);
  };

  return (
    <div className="rights-summary-wrapper">
      <div style={{ position: "relative" }}>
        <div onClick={handleExport} className="download-btn" title="Download Rights Summary">
          <DownloadIcon />
          {loading ? (
            <svg className="spinner" viewBox="0 0 50 50">
              <circle className="path" cx="25" cy="25" r="14" fill="none" strokeWidth="2"></circle>
            </svg>
          ) : (
            ""
          )}
        </div>
      </div>

      <div
        style={{ overflowX: "scroll" }}
        dangerouslySetInnerHTML={{
          __html: content,
        }}
      ></div>
    </div>
  );
};

export default RightsSummary;
