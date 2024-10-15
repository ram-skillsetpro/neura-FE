import IconFile from "assets/images/icon-pdf.svg";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { decodeFileKey, removeHtmlTags, validateEmail } from "src/core/utils";
import { fileShareAddRemoveTeam } from "src/pages/manage-team/team-files/team-files.redux";
import {
  clearUserSearchData,
  fileShareAddRemove,
  shareToExternalUser,
  userSearchList,
  userSearchListSuccesss,
} from "src/pages/user-dashboard/dashboard.redux";
import AppModal from "../app-modal";
import "./_share-popup.scss";
import "./share-modal-common.scss";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  store: "dashboard" | "teamDashboard";
  file?: any;
}

interface UserSearchResult {
  id: number;
  userName: string;
  emailId: string;
  userLogoUrl?: string;
  isExternal?: boolean;
}

// eslint-disable-next-line react/prop-types
const ShareFileModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  fileName,
  store,
  file = {},
}) => {
  const { FileSharedList } = useAppSelector((state) => state[store]);
  const { userSearchData } = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();
  const [internalUserList, setInternalUserList] = useState<Array<any>>([]);
  const [emailInput, setEmailInput] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const suggestionListContainerRef = useRef<HTMLDivElement>(null);
  const [timePeriod, setTimePeriod] = useState(7);
  const [isExternalUser, setExternalUser] = useState(false);
  const [searchParams] = useSearchParams();
  const [externalUserList, setExternalUserList] = useState<any>([]);

  /* Constants */
  const key: any = searchParams.get("key");
  const { fileId, folderId, teamId } = decodeFileKey(key || "");

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setEmailInput(newInput);
    if (newInput.length > 2) {
      const users = await dispatch(userSearchList(newInput));
      if (!Array.from(users || []).length) {
        if (validateEmail(newInput)) {
          dispatch(
            userSearchListSuccesss([
              {
                id: 0,
                emailId: newInput,
                isExternal: true,
                userName: newInput,
                companyId: 0,
                companyName: "",
                countryCode: "",
                createdOn: 0,
                emailVerificationStatus: false,
                mblVerificationStatus: false,
                phone: "",
                roleId: 0,
                status: 0,
                userLogoUrl: "",
                modifiedOn: false,
              },
            ]),
          );
        }
      }
    } else {
      dispatch(clearUserSearchData());
    }
  };

  useEffect(() => {
    setInternalUserList(FileSharedList.internalShare?.filter((d) => !d.isExternal) || []);
    setExternalUserList(FileSharedList.externalShare || []);
  }, [FileSharedList]);

  useEffect(() => {
    if (!selectedUsers.length) {
      setExternalUser(false);
      return;
    }
    const existingExternalUsers = selectedUsers?.filter((d: any) => d.isExternal) || [];
    if (existingExternalUsers.length) {
      setExternalUser(true);
    } else {
      setExternalUser(false);
    }
  }, [selectedUsers]);

  const handleUserSelection = (user: UserSearchResult) => {
    // Ensure user is not already selected
    const isUserSelected = selectedUsers.some(
      (selectedUser) => selectedUser.emailId === user.emailId,
    );

    if (!isUserSelected) {
      setSelectedUsers((prevUsers) => [...prevUsers, user]);
      setEmailInput("");
    } else {
      console.log("User is already selected:", user);
    }
    dispatch(clearUserSearchData());
  };

  const handleRemoveUser = (user: UserSearchResult) => {
    setSelectedUsers((prevUsers) => prevUsers.filter((u) => u.emailId !== user.emailId));
  };

  const handleShareClick = (event: any) => {
    event.preventDefault();
    const profileIds = selectedUsers
      .filter((user) => user.id !== 0 && !user.isExternal)
      .map((user) => user.id);
    const emailcsvs = selectedUsers
      .filter((d) => d.isExternal === true)
      .map((d) => d.emailId)
      .join(",");

    if (emailcsvs) {
      const payload = {
        emailcsv: emailcsvs,
        fileId: fileId || file.id,
        folderId: folderId || file.folderId || undefined,
        teamId: teamId || file.teamId,
        timePeriod,
      };
      if (store === "dashboard") {
        dispatch(shareToExternalUser(payload));
      }
    }

    if (profileIds.length > 0) {
      const payload = {
        fileId: fileId || file.id,
        profileId: profileIds,
        status: 1,
      };
      if (store === "dashboard") {
        dispatch(fileShareAddRemove(payload));
      } else if (store === "teamDashboard") {
        dispatch(fileShareAddRemoveTeam(payload));
      }
    }
    setSelectedUsers([]);
  };

  const handleRemoveSharedList = async (user: UserSearchResult) => {
    const payload = {
      fileId: fileId || file.id,
      profileId: [user.id],
      status: 0,
    };
    if (store === "dashboard") {
      await dispatch(fileShareAddRemove(payload));
    } else if (store === "teamDashboard") {
      // add func once team dashboard ready
      dispatch(fileShareAddRemoveTeam(payload));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionListContainerRef.current &&
        !suggestionListContainerRef.current.contains(event.target as Node)
      ) {
        dispatch(clearUserSearchData());
      }
    };
    if (userSearchData.length > 0) {
      document.addEventListener("mousedown", handleClickOutside);
      // setExternalUser(false);
    }
    if (userSearchData.length === 0 && emailInput !== "") {
      // setExternalUser(true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userSearchData.length, dispatch]);

  return (
    <AppModal isOpen={isOpen} onClose={onClose} shouldCloseOnOverlayClick={true}>
      <div className="team-user-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="team-user-header">
          <div>Share File</div>
          <div onClick={onClose} className="close-popups"></div>
        </div>
        <div className="team-user-body">
          <div className="share-inner">
            <div className="flex flex items-center fs10 mb-4">
              You are Sharing : &nbsp;
              <div className="flex flex items-center">
                <i className="w-20 h-20 mr-2-5 flex">
                  <img src={IconFile} />
                </i>
                <span className="truncate-line1 max-450">{removeHtmlTags(fileName)}</span>
              </div>
            </div>
            <div className="w-full mb-5 relative">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex">
                  {isExternalUser && (
                    <div className="share-input mr-2">
                      <select
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(Number(e.target.value))}
                        className="select-default"
                      >
                        <option value={1}>1 Day</option>
                        <option value={7}>7 Days</option>
                        <option value={14}>14 Days</option>
                        <option value={21}>21 Days</option>
                        <option value={30}>30 Days</option>
                      </select>
                    </div>
                  )}
                  <div className="share-input grow">
                    <input
                      value={emailInput}
                      onChange={handleInputChange}
                      placeholder="Add email addresses"
                      className="bdr6"
                      autoComplete="off"
                    />
                  </div>
                </div>
                {selectedUsers.length > 0 && (
                  <div className="shared-chips-sec">
                    {selectedUsers.map((user, index) => (
                      <div key={index} className="shared-chips">
                        {user.userName}{" "}
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveUser(user)}
                        ></button>
                      </div>
                    ))}
                    <button className="uppercase share-button" onClick={handleShareClick}>
                      share
                    </button>
                  </div>
                )}
                {userSearchData.length > 0 && (
                  <div className="shared-suggestion-list" ref={suggestionListContainerRef}>
                    <ul>
                      {userSearchData.map((user: UserSearchResult, index) => (
                        <li key={index} onClick={() => handleUserSelection(user)}>
                          <a href="#" className="flex items-center">
                            <div className="mr-3 fs12 flex items-center">
                              <div className="shared-user-img rounded-full">
                                {user.userLogoUrl ? (
                                  <img
                                    src={user.userLogoUrl}
                                    alt={user.userName}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <>{user.userName.charAt(0).toUpperCase()} </>
                                )}
                              </div>
                              <div>
                                <div className="mb-1">
                                  {user.userName} {user.isExternal ? "(External)" : ""}
                                </div>
                                <div className="font-bold">{user.emailId}</div>
                              </div>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
            </div>
            <div className="w-full">
              <div className="share-user-info">
                {internalUserList.length ? (
                  <p>
                    This file is also shared with <span>{internalUserList?.length} teams</span>
                  </p>
                ) : (
                  <span>This file is not shared with anyone</span>
                )}
              </div>
              <div className="shared-user-list mb-2">
                <ul>
                  {internalUserList?.map((user, index) => (
                    <li key={index}>
                      <div className="flex items-center">
                        <div className="flex items-center fs12">
                          <div className="share-user-img rounded-full">
                            {user.userLogoUrl ? (
                              <img
                                src={user.userLogoUrl}
                                alt={user.userName}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="share-user-img rounded-full">
                                {user.userName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="block">{user.userName}</div>
                            <div className="block">{user.emailId}</div>
                          </div>
                        </div>
                        <span className="grow"></span>
                        <div>
                          <button
                            className="remove-button uppercase tracking-wider"
                            onClick={() => handleRemoveSharedList(user)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="w-full">
              <div className="share-user-info">
                {Array.isArray(FileSharedList.externalShare) &&
                FileSharedList.externalShare.length ? (
                  <p>
                    This file is also shared with{" "}
                    <span>{FileSharedList.externalShare.length} external users</span>
                  </p>
                ) : (
                  <span>This file is not shared with any external users</span>
                )}
              </div>
              <div className="shared-user-list">
                <ul>
                  {externalUserList?.map((user: any, index: number) => (
                    <li key={index}>
                      <div className="flex items-center">
                        <div className="flex items-center fs12">
                          <div className="share-user-img rounded-full">
                            <div className="share-user-img rounded-full">
                              {user.charAt(0).toUpperCase()}
                            </div>
                          </div>

                          <div>
                            <div className="block">{user}</div>
                          </div>
                        </div>
                        <span className="grow"></span>
                        <div></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default ShareFileModal;
