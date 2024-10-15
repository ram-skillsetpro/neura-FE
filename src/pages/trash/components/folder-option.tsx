import { useAppDispatch } from "core/hook";
import { FolderType } from "pages/user-dashboard/dashboard.model";
import React from "react";
import { restoreDeletedFolder } from "../trash.redux";
import "./file-option.styles.scss";
interface FolderOptionType<T> {
  item: T;
}

const FolderOption: React.FC<FolderOptionType<FolderType>> = ({ item }) => {
  const dispatch = useAppDispatch();
  const handleRestore = async () => {
    await dispatch(restoreDeletedFolder(item.id, item.teamId));
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

export default FolderOption;
