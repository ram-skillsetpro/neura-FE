import MFAModal from "core/components/modals/mfa-modal/mfa-modal";
import useModal from "core/utils/use-modal.hook";
import { motion } from "framer-motion";
import { SecretCode, Status } from "pages/admin-setting/setting.modal";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { USER_AUTHORITY } from "src/const";
import { Loader } from "src/core/components/loader/loader.comp";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import { dataFilterReducer } from "src/layouts/admin/components/data-filter/data-filter.redux";
import { contractReducer } from "../contract/contract.redux";
import { teamReducer } from "../manage-team/team.redux";
import ActivityLog from "./activity-log";
import "./admin-setting.scss";
import Dropdown from "./reusable-dropdown";
import {
  addEditRoles,
  adminProfileList,
  adminSettingReducer,
  clearAdminSettingList,
  resetMFASetting,
  resetPassword,
  setLoading,
  updateAuthorityRoles,
  updateMFASetting,
  updateSelfSetting,
  userProfileList,
} from "./settings-auth.redux";
import UserProfile from "./user-profile";
import ViewTeamsModal from "./view-teams-modal";

const AdminSettingPage = () => {
  const location = useLocation();
  const showData = location.state?.showData || false;
  const buttonAction = location.state?.buttonAction || false;
  const profileId = location.state?.profileId;
  const { adminSettingList } = useAppSelector((state) => state?.adminSettingContract);
  const isLoading = useAppSelector((state) => state.adminSettingContract.isLoading);
  const successMsgOfUpdateSetting = useAppSelector(
    (state) => state.adminSettingContract.successMsgOfUpdateSetting,
  );

  const {
    profileSettings,
    userProfileResponse,
    companyTeamDetails,
    passwordOldDays,
    assignedAuthority,
  } = adminSettingList;

  const { getAddEditRolesList } = useAppSelector((state) => state.adminSettingContract);
  const [isPhoneActive, setIsPhoneActive] = useState(false);
  const [isEmailActive, setIsEmailActive] = useState(false);
  const [showSuggetion, setShowSuggetion] = useState<boolean | undefined>(false);
  const [viewTeam, setViewTeam] = useState(false);

  const [commentNotification, setCommentNotification] = useState<boolean | undefined>(false);
  const [fileEditNotification, setFileEditNotification] = useState<boolean | undefined>(false);
  const [isNewMemberAlertDropdownOpen, setNewMemberAlertDropdownOpen] = useState(false);
  const [isNewFileAlertDropdownOpen, setNewFileAlertDropdownOpen] = useState(false);
  const [isDefaultDropdownOpen, setDefaultDropdownOpen] = useState(false);
  const [isDefaultDropdownValue, setDefaultDropdownValue] = useState("My Drives");
  const [isNewMemberAlertDropdownValue, setNewMemberAlertDropdownValue] = useState("Off");
  const [isNewFileAlertDropdownValue, setNewFileAlertDropdownValue] = useState("Off");
  const [isSecondaryEmailEnable, setSecondaryEmailEnable] = useState<boolean | undefined>(false);
  const [secondaryEmailValue, setSecondaryEmailValue] = useState("");
  const [hasOpenActivityTypeList, setHasOpenActivityTypeList] = useState<boolean>(false);
  const [isQRCodeEnable, toggleQRCodeEnable] = useModal();
  const roleSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);

  // Add a ref to track the initial render
  const isInitialRender = useRef(true);
  // Use state to track updated values
  const updatedValues = useRef<{ [key: string]: any }>({});
  // Use state to trigger the effect when the key or value changes
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const handleResetPassword = async () => {
    await dispatch(resetPassword());
  };

  useEffect(() => {
    const defualtPageVal = profileSettings?.defaultPage === 1 ? "Dashboard" : "My Drives";
    const memberAlertVal =
      profileSettings?.newMenberAlert === 1
        ? "Only My Teams"
        : profileSettings?.newMenberAlert === 0
          ? "Off"
          : "All";
    const fileAlertVal =
      profileSettings?.newFileAlert === 1
        ? "Only My Teams"
        : profileSettings?.newFileAlert === 0
          ? "Off"
          : "All";
    setIsPhoneActive(!!profileSettings?.inappNotification);
    setIsEmailActive(!!profileSettings?.emailNotification);
    setShowSuggetion(profileSettings && profileSettings.showSuggestion);
    setCommentNotification(profileSettings && profileSettings.commentNotification);
    setFileEditNotification(profileSettings && profileSettings.fileEditNotification);
    setDefaultDropdownValue(defualtPageVal);
    setNewMemberAlertDropdownValue(memberAlertVal);
    setNewFileAlertDropdownValue(fileAlertVal);
    setSecondaryEmailValue((profileSettings && profileSettings.alertEmailId) || "");
  }, [profileSettings]);

  const handleButtonClicked = (key: string, isActive: boolean) => {
    const phoneButton = document.querySelector(".calender-status.in-app");
    const emailButton = document.querySelector(".calender-status.in-email");

    const phoneButtonTooltip = document.querySelector(".error-tool-tip.sm.in-app-tooltip");
    const emailButtonTooltip = document.querySelector(".error-tool-tip.sm.in-email-tooltip");

    if (phoneButton) {
      if (key === "1") {
        phoneButton?.classList.toggle("disable");
        setIsPhoneActive((prev) => !prev);
      } else if (key === "2") {
        emailButton?.classList.toggle("disable");
        setIsEmailActive((prev) => !prev);
      }
    }
    if (phoneButtonTooltip) {
      if (key === "1") {
        phoneButtonTooltip?.classList.toggle("enable-tip");
      } else if (key === "2") {
        emailButtonTooltip?.classList.toggle("enable-tip");
      }
    }
    // dispatch(createAlertOnContractCalendar(key, isActive)); // old global alert api commented
  };

  const phoneClassNames = `calender-status in-app ${!isPhoneActive ? "disable" : ""}`;
  const emailClassNames = `calender-status in-email ${!isEmailActive ? "disable" : ""}`;
  const phoneClassNamestool = `error-tool-tip sm in-app-tooltip ${
    isPhoneActive ? "enable-tip" : ""
  }`;
  const emailClassNamestool = `error-tool-tip sm in-email-tooltip ${
    isEmailActive ? "enable-tip" : ""
  }`;

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (profileId) {
      dispatch(userProfileList(profileId));
    } else {
      dispatch(adminProfileList());
    }
    dispatch(addEditRoles());

    return () => {
      dispatch(clearAdminSettingList());
    };
  }, [profileId]);

  const handleDropdownOptionClick = (
    dropdownName: string,
    optionValue: number,
    optionLabel: string,
  ) => {
    if (dropdownName === "DefaultDropdown") {
      setDefaultDropdownValue(optionLabel);
    } else if (dropdownName === "NewMemberAlert") {
      setNewMemberAlertDropdownValue(optionLabel);
    } else {
      setNewFileAlertDropdownValue(optionLabel);
    }
  };

  function generatePayloadAndDispatch<T extends keyof typeof updatedValues.current>(
    key: T,
    value: (typeof updatedValues.current)[T],
  ) {
    updatedValues.current = {
      ...updatedValues.current,
      [key]: value,
    };
    setUpdateTrigger((prev) => prev + 1);
  }

  // Use useEffect to handle the state updates
  useEffect(() => {
    // Skip the initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const payload = {
      ...Object.keys(updatedValues.current).reduce((acc: any, key) => {
        switch (key) {
          case "showSuggetion":
            acc.value = updatedValues.current[key] ? 1 : 0;
            acc.fieldId = 4;
            break;
          case "isPhoneActive":
            acc.value = updatedValues.current[key] ? 1 : 0;
            acc.fieldId = 1;
            break;
          case "isEmailActive":
            acc.value = updatedValues.current[key] ? 1 : 0;
            acc.fieldId = 2;
            break;
          case "commentNotification":
            acc.value = updatedValues.current[key] ? 1 : 0;
            acc.fieldId = 5;
            break;
          case "fileEditNotification":
            acc.value = updatedValues.current[key] ? 1 : 0;
            acc.fieldId = 6;
            break;
          case "isDefaultDropdownValue":
            acc.value =
              updatedValues.current[key] === "My Drives"
                ? 0
                : updatedValues.current[key] === "Teams Drive"
                  ? 3
                  : 1;
            acc.fieldId = 3;
            break;
          case "isNewMemberAlertDropdownValue":
            acc.value =
              updatedValues.current[key] === "All"
                ? 2
                : updatedValues.current[key] === "Off"
                  ? 0
                  : 1;
            acc.fieldId = 7;
            break;
          case "isNewFileAlertDropdownValue":
            acc.value =
              updatedValues.current[key] === "All"
                ? 2
                : updatedValues.current[key] === "Off"
                  ? 0
                  : 1;
            acc.fieldId = 8;
            break;
          case "secondaryEmailEdit":
            acc.value = secondaryEmailValue;
            acc.fieldId = 9;
            break;
          // Add other cases for each key
          default:
            break;
        }
        return acc;
      }, {}),
    };

    dispatch(updateSelfSetting(payload));

    // Reset the updated values for the next iteration
    updatedValues.current = {};
  }, [updateTrigger]);

  const handleActivityTypeDropdown = (e: any) => {
    e.stopPropagation();
    setHasOpenActivityTypeList(!hasOpenActivityTypeList);
  };

  const [selectedAuthorityId, setSelectedAuthorityId] = useState<number[]>([]);

  const handleRoleSelected = (authorityId: number) => {
    // Check if the authorityId is already in the selected list
    if (selectedAuthorityId.includes(authorityId)) {
      // If it is, remove it
      setSelectedAuthorityId((prevIds) => prevIds.filter((id) => id !== authorityId));
    } else {
      // If it's not, add it to the list
      setSelectedAuthorityId((prevIds) => [...prevIds, authorityId]);
    }
  };

  const updateRoles = () => {
    dispatch(updateAuthorityRoles({ authIds: selectedAuthorityId, userId: profileId }, profileId));
  };

  useEffect(() => {
    if (assignedAuthority !== undefined) {
      const initialSelectedAuthorityId = assignedAuthority?.map((item) => item.authorityId);
      setSelectedAuthorityId(initialSelectedAuthorityId);
    }
  }, [assignedAuthority]);

  const handleSecretCode = async () => {
    try {
      dispatch(setLoading(true));
      if (profileSettings?.isMfaEnable === Status.Inactive) {
        // await dispatch(updateMFASetting({ value: Status.Active }));
        toggleQRCodeEnable();
      } else {
        await dispatch(updateMFASetting({ value: Status.Inactive }));
        dispatch(adminProfileList());
      }
      dispatch(setLoading(false));
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  const handleResetMFA = async () => {
    try {
      await dispatch(resetMFASetting({ profileId }));
      dispatch(userProfileList(profileId));
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      {viewTeam && (
        <ViewTeamsModal
          isOpen={viewTeam}
          onClose={() => setViewTeam(false)}
          shouldCloseOnOverlayClick={true}
          team={companyTeamDetails}
        />
      )}
      {isQRCodeEnable && (
        <MFAModal
          isOpen={isQRCodeEnable}
          onClose={() => {
            toggleQRCodeEnable();
          }}
          shouldCloseOnOverlayClick={true}
        />
      )}
      <div className="left-section left-divider-sec">
        <div className="left-section-inner breadCrumbs-space">
          <section className="admin-setting-sec">
            <div className="admin-setting-inner">
              <div className="admin-setting-left">
                <div className="admin-setting-section">
                  <div className="admin-setting-card">
                    <div className="admin-card-left">
                      <UserProfile buttonAction={buttonAction} user={userProfileResponse} />
                    </div>
                    <div className="admin-card-right">
                      <div className="admin-setting-row">
                        <div className="admin-setting-col1 font-bold">Name</div>
                        <div className="admin-setting-col2 fs-lg font-bold">
                          {userProfileResponse && userProfileResponse?.userName}
                        </div>
                      </div>
                      {/* <div className="admin-setting-row">
                        <div className="admin-setting-col1 font-bold">Display Name</div>
                        <div className="admin-setting-col2 fs-lg font-bold">Jans</div>
                        <div className="admin-setting-col3">
                          <div className="flex justify-end">
                            <button className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase">
                              Edit
                            </button>
                          </div>
                        </div>
                      </div> */}
                      <div className="admin-setting-row">
                        <div className="admin-setting-col1 font-bold">Email</div>
                        <div className="admin-setting-col2">
                          {userProfileResponse && userProfileResponse?.emailId}
                        </div>
                      </div>
                      {companyTeamDetails && companyTeamDetails?.length > 0 && (
                        <div className="admin-setting-row">
                          <div className="admin-setting-col1 font-bold">Teams</div>
                          <div className="admin-setting-col2">
                            {/* Amazon, Flintstones LLC and 16 others */}
                            {companyTeamDetails?.length < 3
                              ? companyTeamDetails.map((team, index) => (
                                  <span key={index}>
                                    {team?.teamName}
                                    {index < companyTeamDetails?.length - 1 && ", "}
                                  </span>
                                ))
                              : `${companyTeamDetails
                                  .slice(0, 2)
                                  .map((team) => team?.teamName)
                                  .join(", ")}, and ${companyTeamDetails?.length - 2} others`}
                          </div>
                          <div className="admin-setting-col3">
                            <div className="flex justify-end">
                              <button
                                onClick={() => setViewTeam(true)}
                                className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="admin-setting-right-sec">
                          <NotificationStack />
              </div> */}
            </div>
          </section>
          <section className="admin-setting-sec">
            <div className="admin-setting-inner">
              <div className="admin-setting-left">
                <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase  ml-3">
                  Password and Notifications
                </h2>
              </div>
              {/* <div className="admin-setting-right-sec"></div> */}
            </div>
            <div className="admin-setting-inner">
              <div className="admin-setting-left">
                <div className="admin-setting-section">
                  <div className="admin-setting-card">
                    <div className="admin-card-left">{/* <!--Inner left section--> */}</div>
                    <div className="admin-card-right">
                      <div className="admin-setting-row">
                        <div className="admin-setting-col1 font-bold">Password</div>
                        <div className="admin-setting-col2">
                          {passwordOldDays && passwordOldDays}
                        </div>
                        <div className="admin-setting-col3">
                          <div className="flex justify-end">
                            {showData && (
                              <button
                                onClick={handleResetPassword}
                                className="button-red rounded-12 sm-button tracking-wider font-bold uppercase"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="admin-setting-row">
                        <div className="admin-setting-col1 font-bold">Notifications</div>
                        <div className="admin-setting-col2">
                          {isPhoneActive && isEmailActive
                            ? "All on"
                            : isEmailActive && successMsgOfUpdateSetting
                              ? "Email"
                              : isPhoneActive && successMsgOfUpdateSetting
                                ? "In App"
                                : "All Off"}
                        </div>
                        <div className="admin-setting-col3">
                          <div className="setting-alert">
                            <div className="icons-sec">
                              <div className="relative error-tip-wrap inline-block">
                                <button
                                  className={phoneClassNames}
                                  onClick={() => {
                                    if (buttonAction) {
                                      handleButtonClicked("1", !isPhoneActive);
                                      generatePayloadAndDispatch("isPhoneActive", !isPhoneActive);
                                    }
                                  }}
                                >
                                  <i className="phoneIcon"></i>
                                  {/* <img src={PhoneIcon} /> */}
                                </button>
                                <div className={phoneClassNamestool}>
                                  <div className="block font-bold">
                                    {isPhoneActive ? "Enable" : "Disable"}
                                  </div>
                                  Phone Alert
                                </div>
                              </div>
                              <div className="relative error-tip-wrap inline-block">
                                <button
                                  className={emailClassNames}
                                  onClick={() => {
                                    if (buttonAction) {
                                      handleButtonClicked("2", !isEmailActive);
                                      generatePayloadAndDispatch("isEmailActive", !isEmailActive);
                                    }
                                  }}
                                >
                                  <i className="emailIcon"></i>
                                  {/* <img src={emailIcon} /> */}
                                </button>
                                <div className={emailClassNamestool}>
                                  <div className="block font-bold">
                                    {isEmailActive ? "Enable" : "Disable"}
                                  </div>
                                  Email Alert
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="admin-setting-right-sec">
              </div> */}
            </div>
          </section>
          {showData && (
            <section className="admin-setting-sec">
              <div className="admin-setting-inner">
                <div className="admin-setting-left">
                  <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase  ml-3">
                    History and Browsing
                  </h2>
                </div>
                {/* <div className="admin-setting-right-sec"></div> */}
              </div>
              <div className="admin-setting-inner">
                <div className="admin-setting-left">
                  <div className="admin-setting-section">
                    <div className="admin-setting-card">
                      <div className="admin-card-left">{/* <!--Inner left section--> */}</div>
                      <div className="admin-card-right">
                        {/* <div className="admin-setting-row">
                        <div className="admin-setting-col1 font-bold">Bot Interactions</div>
                        <div className="admin-setting-col2">75</div>
                        <div className="admin-setting-col3">
                          <div className="flex justify-end">
                            <button className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase">
                              delete
                            </button>
                          </div>
                        </div>
                      </div> */}
                        {/* <div className="admin-setting-row">
                        <div className="admin-setting-col1 font-bold">Files</div>
                        <div className="admin-setting-col2">45</div>
                        <div className="admin-setting-col3">
                          <div className="flex justify-end">
                            <button className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase">
                              view
                            </button>
                          </div>
                        </div>
                      </div> */}
                        <div className="admin-setting-row">
                          <div className="admin-setting-col1 font-bold">Default Page</div>
                          <div className="admin-setting-col2">
                            {/* My Drive */}
                            {successMsgOfUpdateSetting && isDefaultDropdownValue}
                          </div>
                          {buttonAction && (
                            <div className="admin-setting-col3">
                              <div className="flex justify-end">
                                <Dropdown
                                  options={[
                                    { label: "Teams Drive", value: 3 },
                                    { label: "My Drives", value: 0 },
                                    { label: "Dashboard", value: 1 },
                                  ]}
                                  onSelect={(value: number, optionLabel: string) => {
                                    handleDropdownOptionClick(
                                      "DefaultDropdown",
                                      value,
                                      optionLabel,
                                    );
                                    generatePayloadAndDispatch(
                                      "isDefaultDropdownValue",
                                      optionLabel,
                                    );
                                  }}
                                  isOpen={isDefaultDropdownOpen}
                                  setOpen={setDefaultDropdownOpen}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="admin-setting-row">
                          <div className="admin-setting-col1 font-bold">Show Suggestions</div>
                          <div className="admin-setting-col2">
                            {successMsgOfUpdateSetting && showSuggetion ? "On" : "Off"}
                          </div>
                          {buttonAction && (
                            <div className="admin-setting-col3">
                              <div className="flex justify-end">
                                <button
                                  onClick={() => {
                                    setShowSuggetion(!showSuggetion);
                                    generatePayloadAndDispatch("showSuggetion", !showSuggetion);
                                  }}
                                  className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                                >
                                  {showSuggetion ? "Turn Off" : "Turn On"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="admin-setting-right-sec">
                </div> */}
              </div>
            </section>
          )}
          {showData && (
            <section className="admin-setting-sec">
              <div className="admin-setting-inner">
                <div className="admin-setting-left">
                  <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
                    security settings
                  </h2>
                </div>
                {/* <div className="admin-setting-right-sec"></div> */}
              </div>
              <div className="admin-setting-inner">
                <div className="admin-setting-left">
                  <div className="admin-setting-section">
                    <div className="admin-setting-card">
                      <div className="admin-card-left">{/* <!--Inner left section--> */}</div>
                      <div className="admin-card-right">
                        {/* <div className="admin-setting-row">
                        <div className="admin-setting-col1 font-bold">Bot Interactions</div>
                        <div className="admin-setting-col2">75</div>
                        <div className="admin-setting-col3">
                          <div className="flex justify-end">
                            <button className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase">
                              delete
                            </button>
                          </div>
                        </div>
                      </div> */}
                        {/* <div className="admin-setting-row">
                        <div className="admin-setting-col1 font-bold">Files</div>
                        <div className="admin-setting-col2">45</div>
                        <div className="admin-setting-col3">
                          <div className="flex justify-end">
                            <button className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase">
                              view
                            </button>
                          </div>
                        </div>
                      </div> */}
                        <div className="admin-setting-row">
                          <div className="admin-setting-col1 font-bold">
                            Multi-factor Authentication
                          </div>
                          <div className="admin-setting-col2">
                            {profileSettings?.isMfaEnable === Status.Active ? "On" : "Off"}
                          </div>
                          {buttonAction && showData && roleSuperAdmin && (
                            <div className="admin-setting-col3 max-w-full">
                              <div className="flex justify-end">
                                <button
                                  onClick={() => {
                                    handleSecretCode();
                                  }}
                                  className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                                >
                                  {profileSettings?.isMfaEnable === Status.Active
                                    ? "Turn Off"
                                    : "Turn On"}
                                </button>
                                {/* {profileSettings?.isMfaEnable === Status.Active && (
                                  <button
                                    onClick={handleGenerateQRCode}
                                    className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase ml-2 px-1"
                                  >
                                    Generate QR Code
                                  </button>
                                )} */}
                              </div>
                            </div>
                          )}

                          {!buttonAction && profileSettings?.isMfaEnable === Status.Active && (
                            <div className="admin-setting-col3 max-w-full">
                              <div className="flex justify-end">
                                <button
                                  onClick={handleResetMFA}
                                  className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase ml-2"
                                  disabled={profileSettings?.secretCode === SecretCode.Inactive}
                                >
                                  Reset MFA
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="admin-setting-right-sec">
                </div> */}
              </div>
            </section>
          )}
          {showData && (
            <section className="admin-setting-sec">
              <div className="admin-setting-inner">
                <div className="admin-setting-left">
                  <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase  ml-3">
                    Other Alerts
                  </h2>
                </div>
                {/* <div className="admin-setting-right-sec"></div> */}
              </div>
              <div className="admin-setting-inner">
                <div className="admin-setting-left">
                  <div className="admin-setting-section">
                    <div className="admin-setting-card">
                      <div className="admin-card-left">{/* <!--Inner left section--> */}</div>
                      <div className="admin-card-right">
                        <div className="admin-setting-row">
                          <div className="admin-setting-col1 font-bold">Comment Notification</div>
                          <div className="admin-setting-col2">
                            {successMsgOfUpdateSetting && commentNotification ? "On" : "Off"}
                          </div>
                          {buttonAction && (
                            <div className="admin-setting-col3">
                              <div className="flex justify-end">
                                <button
                                  onClick={() => {
                                    setCommentNotification(!commentNotification);
                                    generatePayloadAndDispatch(
                                      "commentNotification",
                                      !commentNotification,
                                    );
                                  }}
                                  className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                                >
                                  {commentNotification ? "Turn Off" : "Turn On"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="admin-setting-row">
                          <div className="admin-setting-col1 font-bold">File Edit Alerts</div>
                          <div className="admin-setting-col2">
                            {successMsgOfUpdateSetting && fileEditNotification ? "On" : "Off"}
                          </div>
                          {buttonAction && (
                            <div className="admin-setting-col3">
                              <div className="flex justify-end">
                                <button
                                  onClick={() => {
                                    setFileEditNotification(!fileEditNotification);
                                    generatePayloadAndDispatch(
                                      "fileEditNotification",
                                      !fileEditNotification,
                                    );
                                  }}
                                  className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                                >
                                  {fileEditNotification ? "Turn Off" : "Turn On"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="admin-setting-row">
                          <div className="admin-setting-col1 font-bold">New Member Alert</div>
                          <div className="admin-setting-col2">
                            {/* Only my teams */}
                            {successMsgOfUpdateSetting && isNewMemberAlertDropdownValue}
                          </div>
                          {buttonAction && (
                            <div className="admin-setting-col3">
                              <div className="flex justify-end">
                                <div className="flex justify-end">
                                  <Dropdown
                                    options={[
                                      { label: "Off", value: 0 },
                                      { label: "Only My Teams", value: 1 },
                                      { label: "All", value: 2 },
                                    ]}
                                    onSelect={(value: number, optionLabel: string) => {
                                      handleDropdownOptionClick(
                                        "NewMemberAlert",
                                        value,
                                        optionLabel,
                                      );
                                      generatePayloadAndDispatch(
                                        "isNewMemberAlertDropdownValue",
                                        optionLabel,
                                      );
                                    }}
                                    isOpen={isNewMemberAlertDropdownOpen}
                                    setOpen={setNewMemberAlertDropdownOpen}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="admin-setting-row">
                          <div className="admin-setting-col1 font-bold">New File Alert</div>
                          <div className="admin-setting-col2">
                            {/* All */}
                            {successMsgOfUpdateSetting && isNewFileAlertDropdownValue}
                          </div>
                          {buttonAction && (
                            <div className="admin-setting-col3">
                              <div className="flex justify-end">
                                <div className="flex justify-end">
                                  <Dropdown
                                    options={[
                                      { label: "Off", value: 0 },
                                      { label: "Only My Teams", value: 1 },
                                      { label: "All", value: 2 },
                                    ]}
                                    onSelect={(value: number, optionLabel: string) => {
                                      handleDropdownOptionClick("NewFileAlert", value, optionLabel);
                                      generatePayloadAndDispatch(
                                        "isNewFileAlertDropdownValue",
                                        optionLabel,
                                      );
                                    }}
                                    isOpen={isNewFileAlertDropdownOpen}
                                    setOpen={setNewFileAlertDropdownOpen}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="admin-setting-row items-center">
                          <div className="admin-setting-col1 font-bold">Secondary Email Alert</div>
                          <div className="admin-setting-col2">
                            {/* All */}
                            {!isSecondaryEmailEnable && secondaryEmailValue}
                            {isSecondaryEmailEnable && (
                              <div className="flex items-center secondary-email">
                                <input
                                  type="text"
                                  onChange={(e) => setSecondaryEmailValue(e.target.value)}
                                  value={secondaryEmailValue}
                                />
                                <button
                                  className="filter-reset cursor-pointer"
                                  onClick={() => {
                                    setSecondaryEmailEnable(false);
                                    setSecondaryEmailValue(
                                      profileSettings?.alertEmailId || secondaryEmailValue,
                                    );
                                  }}
                                ></button>
                              </div>
                            )}
                          </div>
                          {buttonAction && (
                            <div className="admin-setting-col3">
                              <div className="flex justify-end">
                                {isSecondaryEmailEnable && (
                                  <button
                                    onClick={() => {
                                      setSecondaryEmailEnable(false);
                                      generatePayloadAndDispatch(
                                        "secondaryEmailEdit",
                                        !isSecondaryEmailEnable,
                                      );
                                    }}
                                    className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                                  >
                                    {"Submit"}
                                  </button>
                                )}
                                {!isSecondaryEmailEnable && (
                                  <button
                                    onClick={() => {
                                      setSecondaryEmailEnable(true);
                                    }}
                                    className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                                  >
                                    {"Change"}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="admin-setting-right-sec">
                </div> */}
              </div>
            </section>
          )}
          {/* {!buttonAction && ( */}
          <section className="admin-setting-sec">
            <div className="admin-setting-inner">
              <div className="admin-setting-left">
                <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase  ml-3">
                  Manage Authority
                </h2>
              </div>
              {/* <div className="admin-setting-right-sec"></div> */}
            </div>
            <div className="admin-setting-inner">
              <div className="admin-setting-left">
                <div className="admin-setting-section">
                  <div className="admin-setting-card">
                    <div className="admin-card-left">{/* <!--Inner left section--> */}</div>
                    <div className="admin-card-right">
                      <div className="admin-setting-row">
                        <div className="admin-setting-col1 font-bold">Authorities</div>
                        <div className="admin-setting-col2">
                          {/* My Drive */}
                          {assignedAuthority && assignedAuthority?.length > 0 ? (
                            assignedAuthority.map((item, index) => (
                              <span key={item.authorityId}>
                                {item.displayName}
                                {index < assignedAuthority.length - 1 && ", "}
                              </span>
                            ))
                          ) : (
                            <div>No Authority Assigned</div>
                          )}
                        </div>
                        {!buttonAction && (
                          <div className="admin-setting-col3">
                            <div className="flex justify-end flex-column">
                              {getAddEditRolesList.length ? (
                                <div className="filter-menu-modal relative mb-2">
                                  <button
                                    onClick={handleActivityTypeDropdown}
                                    className={`file-btn1 font-bold down-icon cursor-pointer ${
                                      selectedAuthorityId?.length > 0 && !hasOpenActivityTypeList
                                        ? "filter-active"
                                        : ""
                                    }`}
                                  >
                                    Select Role
                                  </button>
                                  {hasOpenActivityTypeList && (
                                    <motion.div
                                      exit={{ opacity: 0 }}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ duration: 0.3 }}
                                      className="filter-menu-card rounded-6 user-filter-menu-card"
                                    >
                                      <ul>
                                        {getAddEditRolesList.map((data, index) => (
                                          <li key={index} onClick={(e) => e.stopPropagation()}>
                                            <div className="truncate-line1">{`${data.displayName}`}</div>
                                            <div className="ch-box">
                                              <input
                                                // checked={checkedActivityType(data)}
                                                checked={selectedAuthorityId.includes(
                                                  data.authorityId,
                                                )}
                                                type="checkbox"
                                                onChange={() => {
                                                  // dispatch(setSelectedActivityType(data))
                                                  handleRoleSelected(data.authorityId);
                                                }}
                                              />
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    </motion.div>
                                  )}
                                </div>
                              ) : (
                                ""
                              )}
                              <button
                                className="button-dark-gray rounded-12 sm-button tracking-wider
                                font-bold uppercase"
                                onClick={() => updateRoles()}
                              >
                                Update
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="admin-setting-right-sec">
           
              </div> */}
            </div>
          </section>
          {/* )} */}
          {showData && <ActivityLog />}
        </div>
      </div>
    </>
  );
};

export default AdminSettingPage;

export const reducer = {
  adminSettingContract: adminSettingReducer,
  team: teamReducer,
  contract: contractReducer,
  dataFilter: dataFilterReducer,
};
