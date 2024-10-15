import React from "react";
import { useAppSelector } from "src/core/hook";

interface UploadingFilesViewProps {
  store: "dashboard" | "teamDashboard";
}
const UploadingFilesView: React.FC<UploadingFilesViewProps> = ({ store }) => {
  const uploadingFiles = useAppSelector((state) => state[store].uploadingFiles);
  return (
    <>
      {uploadingFiles.length > 0 && (
        <div className="files-container-list">
          <div className="wrapper nobg">
            <h3>Uploading</h3>
            <p className="meta">{uploadingFiles.length} Uploading</p>
          </div>
          <div className="wrapper">
            <div className="file-item header-row">
              <div className="file-item-selector">
                <p>
                  <input type="checkbox" />
                </p>
              </div>
              <div className="file-item-icon"></div>
              <div className="file-item-name">
                <p>Name</p>
              </div>
              <div className="file-item-uploading"></div>
            </div>
            {uploadingFiles.map((file) => (
              <div className="file-item each-item" key={file.id}>
                <div className="file-item-selector">
                  <p>
                    <input type="checkbox" />
                  </p>
                </div>
                <div className="file-item-icon">
                  <p>
                    <span className="icon anyfile"></span>
                  </p>
                </div>
                <div className="file-item-name">
                  <p>{file.fileName}</p>
                </div>
                <div className={`file-item-${file.pfg ? "parsing" : "uploading"}`}>
                  {file.progress === 100 && file.pfg ? (
                    <p>Parsing</p>
                  ) : (
                    <p>Uploading - {file.progress}%</p>
                  )}
                  <div
                    className={`${file.progress === 100 && file.pfg ? "parsing" : "uploader"}-bar`}
                  >
                    <div className="progress" style={{ width: `${file.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default UploadingFilesView;
