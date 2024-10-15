import React, { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { validateEmail } from "src/core/utils";
import {
  clearUserSearchData,
  userSearchList,
  userSearchListSuccesss,
} from "src/pages/user-dashboard/dashboard.redux";
import AppModal from "../app-modal";
import { AppModalType } from "../app-modal.model";
import "./share-snippet-modal.scss";

interface ShareSnippetModalType extends AppModalType {
  onClose: () => void;
  onSuccess: (
    selectedUsers: Array<any>,
    setSelectedUsers: (selectedUsers: Array<any>) => void,
    timePeriod: number,
  ) => void;
}

interface UserSearchResult {
  id: number;
  userName: string;
  emailId: string;
  userLogoUrl?: string;
}

const ShareSnippetModal: React.FC<ShareSnippetModalType> = ({
  isOpen,
  onClose,
  shouldCloseOnOverlayClick,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();

  const suggestionListContainerRef = useRef<HTMLDivElement>(null);

  const [emailInput, setEmailInput] = useState("");
  const [timePeriod, setTimePeriod] = useState(7);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);

  const { userSearchData } = useAppSelector((state) => state.dashboard);

  const handleInputChange = async (newInput: string) => {
    setEmailInput(newInput);
    if (newInput.length > 2) {
      const users = await dispatch(userSearchList(newInput));

      if (!Array.from(users || []).length) {
        validateEmail(newInput) &&
          dispatch(
            userSearchListSuccesss([
              {
                id: Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000,
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
    } else {
      dispatch(clearUserSearchData());
    }
  };

  const handleUserSelection = (user: UserSearchResult) => {
    const isUserSelected = selectedUsers.some((selectedUser) => selectedUser.id === user.id);
    if (!isUserSelected) {
      setSelectedUsers((prevUsers) => [...prevUsers, user]);
    }
    dispatch(clearUserSearchData());
    setEmailInput("");
  };

  const handleRemoveUser = (user: UserSearchResult) => {
    setSelectedUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
  };

  const handleShareClick = (event: any) => {
    event.preventDefault();
    onSuccess(selectedUsers, setSelectedUsers, timePeriod);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (validateEmail(emailInput)) {
      handleUserSelection({
        id: Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000,
        emailId: emailInput,
        userName: emailInput,
        userLogoUrl: "",
      });
      setEmailInput("");
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
    >
      <div className="team-user-list-modal">
        <div className="team-user-header">
          <div>Share Contract Excerpts</div>
          <div onClick={onClose} className="close-popups" />
        </div>
        <div className="team-user-body">
          <div className="share-inner">
            <div className="w-full mb-5 relative">
              <form onSubmit={handleSubmit}>
                <div className="flex">
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
                  <div className="share-input grow">
                    <input
                      value={emailInput}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder="Add comma separated email addresses"
                      className="bdr6"
                    />
                  </div>
                </div>
                {selectedUsers.length > 0 && (
                  <div className="shared-chips-sec">
                    {selectedUsers.map((user) => (
                      <div key={user.id} className="shared-chips">
                        {user.emailId}{" "}
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveUser(user)}
                        ></button>
                      </div>
                    ))}
                    <button className="uppercase share-button" onClick={handleShareClick}>
                      Save and Share
                    </button>
                  </div>
                )}
                {userSearchData.length > 0 && (
                  <div className="shared-suggestion-list" ref={suggestionListContainerRef}>
                    <ul>
                      {userSearchData.map((user: UserSearchResult) => (
                        <li key={user.id} onClick={() => handleUserSelection(user)}>
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
                                  <>{user.userName.charAt(0).toUpperCase()}</>
                                )}
                              </div>
                              <div>
                                <div className="mb-1">{user.userName}</div>
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
            {/* <div className="w-full">
              <div className="share-user-info">
                <p>
                  This file is also shared with <span>1 teams</span>
                </p>
              </div>
              <div className="shared-user-list">
                <ul>
                  <li>
                    <div className="flex items-center">
                      <div className="flex items-center fs12">
                        <div className="share-user-img rounded-full">
                          <div className="share-user-img rounded-full">R</div>
                        </div>
                        <div>
                          <div className="block">Rishabh</div>
                          <div className="block">rishabhd@dewsolutions.in</div>
                        </div>
                      </div>
                      <span className="grow" />
                      <div>
                        <button className="remove-button uppercase tracking-wider">Remove</button>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default ShareSnippetModal;
