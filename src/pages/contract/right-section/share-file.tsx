import React, { useEffect, useState } from "react";
import ShareUserModal from "src/core/components/modals/share-file-modal/share-file-modal";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { getSharedFile, getSharedFileSender } from "../../user-dashboard/dashboard.redux";
import { getSharedUser } from "../contract.redux";

const ShareFile: React.FC<{ fileId: number; createdBy: string }> = (props) => {
  const authData = localStorage.getItem("auth");
  const profileId = authData ? JSON.parse(authData).profileId : null;
  const dispatch = useAppDispatch();
  const { fileId, createdBy } = props;
  const [shareModal, setShareModal] = useState(false);
  useEffect(() => {
    dispatch(getSharedUser(fileId));
  }, [fileId]);

  const { shareUser, fileName } = useAppSelector((state) => state.contract);

  const handleShare = async (e: any) => {
    await dispatch(getSharedFile(fileId));
    await dispatch(getSharedFileSender(1));
    e.stopPropagation();
    setShareModal(true);
  };

  return (
    <>
      <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3">
        Sharing
      </h4>
      <div className="flex right-top-sec">
        <div className="sharing-members">
          <ul>
            {shareUser?.length > 0 &&
              shareUser.map((user, index) => (
                <li key={user.id}>
                  <div
                    className="ic-member tool-tip-wrap"
                    style={{
                      backgroundColor: index % 2 === 0 ? "#9CBAD0" : "#589BCD",
                      color: "white",
                    }}
                  >
                    {user.logoUrl ? (
                      <img src={user.logoUrl} alt={user.userName} />
                    ) : (
                      <div className="member-initials">{user.userName.charAt(0).toUpperCase()}</div>
                    )}
                    <div className="fixed h-26 z-9">
                      <div className="tool-tip-card rounded-6">
                        <div className="block font-bold">{user.userName}</div>
                        SimpleO
                      </div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
        <span className="grow" />
        {profileId.toString() === createdBy.toString() && (
          <div>
            <button
              className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase lh-0"
              onClick={(e) => handleShare(e)}
            >
              Share
            </button>
          </div>
        )}
      </div>
      {shareModal && (
        <ShareUserModal
          isOpen={shareModal}
          onClose={() => setShareModal(false)}
          fileName={fileName}
          store="dashboard"
        />
      )}
    </>
  );
};

export default ShareFile;
