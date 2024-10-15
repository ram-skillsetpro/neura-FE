import { useAppDispatch } from "core/hook";
import { FileType } from "pages/trash/trash.model";
import React from "react";
import { restoreDeletedFiles } from "../trash.redux";
import "./file-option.styles.scss";
interface FileOptionType {
  file: FileType;
}

const FileOption: React.FC<FileOptionType> = ({ file }) => {
  const dispatch = useAppDispatch();
  const handleRestore = async () => {
    await dispatch(restoreDeletedFiles(file.id));
  };

  return (
    <div className="dropdown-container">
      <div className="dropdown-box">
        <ul>
          <li onClick={() => handleRestore()} className="border-bottom">
            Restore
          </li>
        </ul>
      </div>
      <div className="notch"></div>
    </div>
  );
};

export default FileOption;
