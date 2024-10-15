import { useAuthorityCheck } from "core/utils/use-authority-check.hook";
import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ROUTE_ADMIN, UPLOAD_AND_SIGN, USER_AUTHORITY } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import {
  fetchRoles,
  fetchRolesForUploadAndSign,
  getUsersPreContract,
  getUsersSignAndUpload,
} from "../pre-contract.redux";
import ShareUserModal from "./share-modal-precontract";

const SharePreContract: React.FC = () => {
  const dispatch = useAppDispatch();
  const [shareModal, setShareModal] = useState(false);
  const { contractId, createdby, activeStagePreContract, contractTypeId } = useAppSelector(
    (state) => state.preContract,
  );
  const isContractCreator = useAuthorityCheck([USER_AUTHORITY.ROLE_PRE_CONTRACT_CREATOR]);
  const authData = JSON.parse(localStorage.getItem("auth") || "{}");
  const profileID = authData?.profileId ? authData.profileId : "";
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");
  const location = useLocation();

  const { shareUser, fileName } = useAppSelector((state) => state.preContract);

  const handleShare = async (e: any) => {
    e.stopPropagation();
    setShareModal(true);
  };

  useEffect(() => {
    if (location?.pathname === `/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN}`) {
      dispatch(getUsersSignAndUpload(contractId));
      dispatch(fetchRolesForUploadAndSign());
    } else {
      dispatch(getUsersPreContract(contractId));
    }
    dispatch(fetchRoles());
  }, []);

  return (
    <>
      <div
        className={`flex right-top-sec ${location?.pathname === `/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN}` ? "upload-sign" : ""}`}
      >
        {isContractCreator && contractId && key && createdby === profileID && (
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
                        <div className="member-initials">
                          {user.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="fixed h-26 z-9">
                        <div className="tool-tip-card rounded-6">
                          <div className="block font-bold">
                            {user.userName} {user.isExternal ? "(External)" : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}
        <span className="grow" />
        {activeStagePreContract < 6 &&
        location?.pathname === "/admin/pre-contract" &&
        isContractCreator &&
        contractId &&
        key &&
        createdby === profileID &&
        contractTypeId ? (
          <div>
            <button
              className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase lh-0"
              onClick={(e) => handleShare(e)}
            >
              Share
            </button>
          </div>
        ) : (
          ""
        )}

        {activeStagePreContract < 6 &&
          contractId &&
          key &&
          createdby === profileID &&
          location?.pathname === `/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN}` && (
            <div>
              <button
                className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase lh-0"
                onClick={(e) => handleShare(e)}
              >
                Add Signatory
              </button>
            </div>
          )}
      </div>
      {shareModal && (
        <ShareUserModal
          isOpen={shareModal}
          onClose={() => {
            setShareModal(false);
          }}
          fileName={fileName}
        />
      )}
    </>
  );
};

export default SharePreContract;
