import {
  closeShareDialog as closeTeamShareDialog,
  submitFileShare as submitTeamFileShare,
} from "pages/manage-team/team-files/team-files.redux";
import { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { getAuth } from "src/core/utils";
import { closeShareDialog, submitFileShare } from "src/pages/user-dashboard/dashboard.redux";
import "./modal.component.scss";

interface IModalProps {
  store: "dashboard" | "teamDashboard";
}

const ModalComponent: FC<IModalProps> = ({ store }) => {
  const { FileSharedList, FileSharedSenderList, fileId } = useAppSelector((state) => state[store]);
  const dispatch = useAppDispatch();
  const [profileStatus, setProfileStatus] = useState<Record<number, string>>({});
  const [userList, setUserList] = useState<Array<any>>([]);

  useEffect(() => {
    const initialProfileStatus: Record<number, string> = {};
    FileSharedSenderList.forEach((sender) => {
      const isShared = FileSharedList.some((item) => item.sharedWithProfileId === sender.id);
      initialProfileStatus[sender.id] = isShared ? "Remove" : "Add";
    });

    setProfileStatus(initialProfileStatus);
  }, [FileSharedList, FileSharedSenderList]);

  useEffect(() => {
    if (Array.isArray(FileSharedSenderList) && FileSharedSenderList.length > 0) {
      setUserList(FileSharedSenderList.filter((item) => item.id !== getAuth().profileId));
    }
  }, [FileSharedSenderList]);

  const toggleProfileStatus = (id: number) => {
    // Toggle the status between "Add" and "Remove"
    setProfileStatus((prevStatus) => ({
      ...prevStatus,
      [id]: prevStatus[id] === "Add" ? "Remove" : "Add",
    }));
  };

  const handleDialogClose = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target instanceof HTMLElement && e.target.classList.contains("close-popups")) {
      if (store === "dashboard") {
        dispatch(closeShareDialog());
      } else if (store === "teamDashboard") {
        dispatch(closeTeamShareDialog());
      }
    }
  };

  const handleShareClick = async () => {
    const profilesToRemove = Object.entries(profileStatus)
      .filter(([id, status]) => status === "Remove")
      .map(([id]) => parseInt(id));
    const payload = {
      fileId,
      profileId: profilesToRemove,
    };
    if (store === "dashboard") {
      dispatch(submitFileShare(payload));
      dispatch(closeShareDialog());
    } else if (store === "teamDashboard") {
      dispatch(submitTeamFileShare(payload));
      dispatch(closeTeamShareDialog());
    }
  };

  return (
    <div className="popup-containers" id="share-popup">
      <div className="popups">
        <div className="close-popups" onClick={handleDialogClose}></div>
        <div className="files-share-list">
          <div className="file-items header-row-no-bg">
            <div className="file-item-name-no-bg">
              {FileSharedList.length ? (
                <p>
                  This file is also shared with the following <b>{FileSharedList.length} people</b>
                </p>
              ) : (
                <p>This file is not shared with anyone</p>
              )}
            </div>
          </div>
          <div className="wrapper">
            <div className="file-items header-row">
              <div className="file-item-name">
                <p>
                  <b>Name</b>
                </p>
              </div>
              <div className="file-item-name">
                <p>
                  <b>Email</b>
                </p>
              </div>
              <div className="file-item-name">
                <p>
                  <b>Status</b>
                </p>
              </div>
            </div>
            {userList.map((sender) => (
              <div
                className="file-items each-item"
                key={sender.id}
                onClick={() => toggleProfileStatus(sender.id)}
              >
                <div className="file-item-name">
                  <p>{sender.companyName}</p>
                </div>
                <div className="file-item-name">
                  <p>{sender.emailId}</p>
                </div>
                <div className="file-item-name">
                  <p>
                    {profileStatus[sender.id] === "Remove" ? (
                      <span className="sharesd">Remove</span>
                    ) : (
                      <span className="not-shared">Add</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pink-button" onClick={handleShareClick}>
          Share
        </div>
      </div>
    </div>
  );
};

export default ModalComponent;
