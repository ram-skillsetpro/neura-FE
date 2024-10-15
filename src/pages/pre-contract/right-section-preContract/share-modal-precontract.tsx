import IconFile from "assets/images/icon-pdf.svg";
import { Form, Formik, FormikHelpers } from "formik";
import { motion } from "framer-motion";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { PRE_CONTRACT, ROUTE_ADMIN, UPLOAD_AND_SIGN } from "src/const";
import { CountryCodeFormGroup } from "src/core/components/form/CountryCodeFormGroup";
import { FormGroup } from "src/core/components/form/FormGroup";
import AppModal from "src/core/components/modals/app-modal";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { CommonService } from "src/core/services/common.service";
import { FormValidation } from "src/core/services/form-validation.service";
import { PHONE_REGEX, USER_EMAIL_REGEX } from "src/core/utils/constant";
import { CountryCodeType } from "src/pages/manage-members/manage-members.model";
import { getCountryCodeList } from "src/pages/manage-members/manage-members.redux";
import { object, string } from "yup";
import { User } from "../pre-contract.model";
import {
  AddExternalUser,
  AddRolesForUser,
  AddRolesUploadAndSign,
  clearUserSearchData,
  removeSharedUser,
  removeSharedUserUploadAndSign,
  userSearchListPrecontract,
} from "../pre-contract.redux";
import "./share-modal-common-precontract.scss";
import "./share-modal-precontract.scss";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
}

interface UserSearchResult {
  id: number;
  userName: string;
  emailId: string;
  userLogoUrl?: string;
  isExternal?: boolean;
}

export interface UserList {
  id: number;
  userName: string;
  logoUrl: string;
  authority: AuthorityList[];
  isExternal: boolean;
}

export interface AuthorityList {
  id: number;
  name: string;
  description: string;
  status: number;
  authorityType: number;
  displayName: string;
}

interface CreateNewMemberPayload {
  emailId: string;
  phone: string;
  userName: string;
  countryCode: string;
}

const initialState = {
  emailId: "",
  phone: "",
  userName: "",
  countryCode: "+91",
};

// eslint-disable-next-line react/prop-types
const ShareFileModalPrecontract: React.FC<ShareModalProps> = ({ isOpen, onClose, fileName }) => {
  const {
    shareUserInternal,
    shareUserExternal,
    userSearchData,
    authorityList,
    contractId,
    shareUser,
    authorityListUploadAndSign,
  } = useAppSelector((state) => state.preContract);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [emailInput, setEmailInput] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const suggestionListContainerRef = useRef<HTMLDivElement>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  const addTeamRef = useRef<HTMLDivElement | null>(null);
  const [hasOpenTypeList, setHasOpenTypeList] = useState<boolean>(false);
  const [isExternalUser, setIsExternalUser] = useState<boolean>(false);
  const [selectedAuthorities, setSelectedAuthorities] = useState<number[]>([]);
  const [countryCodeList, setCountryCodeList] = useState<Array<CountryCodeType>>([]);
  const [formData, setFormData] = useState(initialState);
  const activeStagePreContract = useAppSelector(
    (state) => state.preContract.activeStagePreContract,
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setEmailInput(newInput);
    if (newInput.length > 2) {
      dispatch(userSearchListPrecontract(newInput));
    } else {
      dispatch(clearUserSearchData());
    }
  };

  const handleAuthorityChange = (authorityId: number) => {
    setSelectedAuthorities((prevAuthorities) => {
      const isSelected = prevAuthorities.includes(authorityId);
      if (isSelected) {
        return prevAuthorities.filter((id) => id !== authorityId);
      } else {
        return [...prevAuthorities, authorityId];
      }
    });
  };

  const handleUserSelection = (user: UserSearchResult) => {
    const isUserSelected = selectedUsers.some((selectedUser) => selectedUser.id === user.id);
    const isUserAlreadyShared = shareUser.some((sharedUser) => sharedUser.id === user.id);
    if (!isUserSelected) {
      if (isUserAlreadyShared) {
        CommonService.toast({
          type: "error",
          message: `This file is already shared with ${user.userName}`,
        });
        dispatch(clearUserSearchData());
      } else {
        setSelectedUsers(() => [user]);
        setIsExternalUser(user.isExternal ?? false);
        dispatch(clearUserSearchData());
        if (
          activeStagePreContract > 4 ||
          location.pathname.includes(`/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN}`)
        ) {
          const authorityIds = authorityListUploadAndSign.map((authority) => authority.authorityId);
          setSelectedAuthorities(authorityIds);
        } else {
          setSelectedAuthorities([]);
        }
      }
    }
  };

  const handleEdit = (user: UserList) => {
    const selectedUser: UserSearchResult = {
      id: user?.id,
      userName: user?.userName,
      emailId: "",
      userLogoUrl: user?.logoUrl,
    };
    setSelectedUsers([selectedUser]);
    setIsExternalUser(user.isExternal ?? false);
    const authorityIds: number[] = user.authority.map((authority) => authority.id);
    setSelectedAuthorities(authorityIds);
    setHasOpenTypeList(!hasOpenTypeList);
    dispatch(clearUserSearchData());
  };

  const handleTypeDropdown = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    setHasOpenTypeList(!hasOpenTypeList);
  };

  const handleAdd = async (user: UserSearchResult) => {
    const payload = {
      contractId,
      roleIds: selectedAuthorities,
      userId: user.id,
    };
    if (location?.pathname === `/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN}`) {
      await dispatch(AddRolesUploadAndSign(payload));
    } else {
      await dispatch(AddRolesForUser(payload));
    }
    setSelectedUsers([]);
    setIsExternalUser(false);
  };

  const handleRemove = async (user: User) => {
    if (location?.pathname === `/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN}`) {
      await dispatch(removeSharedUserUploadAndSign(contractId, user.id));
    } else {
      await dispatch(removeSharedUser(contractId, user.id));
    }
  };

  const newMemberSchema = object().shape({
    emailId: string().required().email().matches(USER_EMAIL_REGEX),
    phone: string().matches(PHONE_REGEX, "Enter valid number"),
    userName: string()
      .required()
      .min(4)
      .max(50)
      .matches(/^[a-zA-Z ]+$/, "Invalid Name"),
    countryCode: string().required(),
  });

  const handleSubmit = async (
    data: CreateNewMemberPayload,
    actions: FormikHelpers<CreateNewMemberPayload>,
  ) => {
    const payload = {
      contractId,
      countryCode: data.countryCode,
      email: data.emailId,
      phoneNo: data.phone,
      userName: data.userName,
    };
    try {
      const response = await dispatch(AddExternalUser(payload));
      if (response?.isSuccess) {
        const userData = response.data;
        const selectedUser: UserSearchResult = {
          id: userData?.uid,
          userName: userData?.unm,
          emailId: userData?.ueid,
          userLogoUrl: userData?.ulogo,
        };
        setSelectedUsers([selectedUser]);
        setIsExternalUser(true);
        if (location.pathname.includes(`/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN}`)) {
          const authorityIds = authorityListUploadAndSign.map((authority) => authority.authorityId);
          setSelectedAuthorities(authorityIds);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      actions.resetForm();
      setFormData(initialState);
    }
  };

  const handleEnterPress = () => {
    if (userSearchData.length === 1) {
      setSelectedUsers([userSearchData[0]]);
      setSelectedAuthorities([]);
      setIsExternalUser(false);
      dispatch(clearUserSearchData());
    } else if (userSearchData.length === 0) {
      setIsExternalUser(true);
      setSelectedUsers([]);
      setFormData({
        ...initialState,
        emailId: emailInput,
      });
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
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userSearchData.length, dispatch]);

  useEffect(() => {
    const handleClickOutsideDropdown = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement | null;
      if (
        hasOpenTypeList &&
        dropdownContainerRef.current &&
        targetElement &&
        !dropdownContainerRef.current.contains(targetElement) &&
        !(targetElement.closest && targetElement.closest(".filter-menu-modal"))
      ) {
        setHasOpenTypeList(false);
      }
    };

    if (hasOpenTypeList) {
      document.addEventListener("mousedown", handleClickOutsideDropdown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
    };
  }, [hasOpenTypeList]);

  useEffect(() => {
    const fetchCountryCodeList = async () => {
      try {
        const countryCodeList = await dispatch(getCountryCodeList());
        if (countryCodeList) {
          const [, ...rest] = countryCodeList;
          setCountryCodeList(rest);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchCountryCodeList();
  }, []);

  return (
    <AppModal isOpen={isOpen} onClose={onClose} shouldCloseOnOverlayClick={true}>
      <div className="team-user-list-modal">
        <div className="team-user-header">
          <div className="flex flex items-center fs10">
            You are Sharing : &nbsp;
            <div className="flex flex items-center">
              <i className="w-20 h-20 mr-2-5 flex">
                <img src={IconFile} />
              </i>
              {fileName}
            </div>
          </div>
          <div onClick={onClose} className="close-popups"></div>
        </div>
        <div className="team-user-body">
          <div className="share-inner">
            <div className="w-full mb-5 relative">
              <form>
                <div className="share-input">
                  <input
                    value={emailInput}
                    onChange={handleInputChange}
                    placeholder="Add email addresses"
                    autoComplete="off"
                    className="bdr6"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleEnterPress();
                      }
                    }}
                  />
                </div>

                {selectedUsers.length > 0 && (
                  <div className="shared-user-list mt-3">
                    <ul>
                      {selectedUsers.map((user) => (
                        <li key={user.id}>
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
                            <div className="filter-menu-modal relative" ref={dropdownContainerRef}>
                              <button
                                onClick={handleTypeDropdown}
                                className={`file-btn1 mr-3 down-icon cursor-pointer ${
                                  authorityList.length > 0 ? "filter-active" : ""
                                }`}
                                disabled={isExternalUser && activeStagePreContract > 5}
                              >
                                Select Role
                              </button>
                              {hasOpenTypeList &&
                                isExternalUser &&
                                activeStagePreContract <= 5 &&
                                location.pathname.includes(`/${ROUTE_ADMIN}/${PRE_CONTRACT}`) && (
                                  <motion.div
                                    exit={{ opacity: 0 }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="filter-menu-card lp-share rounded-6 contract-filter-menu-card"
                                  >
                                    <ul>
                                      {authorityList
                                        .filter(
                                          (data) =>
                                            data.authorityId === 22 ||
                                            data.authorityId === 23 ||
                                            data.authorityId === 24,
                                        )
                                        .map((data, index) => (
                                          <li key={index} onClick={(e) => e.stopPropagation()}>
                                            <div className="truncate-line1">{data.displayName}</div>
                                            <div className="ch-box">
                                              <input
                                                checked={selectedAuthorities.includes(
                                                  data.authorityId,
                                                )}
                                                type="checkbox"
                                                onChange={() =>
                                                  handleAuthorityChange(data.authorityId)
                                                }
                                              />
                                            </div>
                                          </li>
                                        ))}
                                    </ul>
                                  </motion.div>
                                )}
                              {hasOpenTypeList ? (
                                !isExternalUser ||
                                location.pathname.includes(`/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN}`) ? (
                                  <motion.div
                                    exit={{ opacity: 0 }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="filter-menu-card lp-share rounded-6 contract-filter-menu-card"
                                  >
                                    <ul>
                                      {activeStagePreContract <= 5 &&
                                      location.pathname.includes(`/${ROUTE_ADMIN}/${PRE_CONTRACT}`)
                                        ? authorityList.map((data, index) => (
                                            <li key={index} onClick={(e) => e.stopPropagation()}>
                                              <div className="truncate-line1">
                                                {data.displayName}
                                              </div>
                                              <div className="ch-box">
                                                <input
                                                  checked={selectedAuthorities.includes(
                                                    data.authorityId,
                                                  )}
                                                  type="checkbox"
                                                  onChange={() =>
                                                    handleAuthorityChange(data.authorityId)
                                                  }
                                                />
                                              </div>
                                            </li>
                                          ))
                                        : activeStagePreContract > 4 ||
                                            location.pathname.includes(
                                              `/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN}`,
                                            )
                                          ? authorityListUploadAndSign.map((data, index) => (
                                              <li key={index} onClick={(e) => e.stopPropagation()}>
                                                <div className="truncate-line1">
                                                  {data.displayName}
                                                </div>
                                                <div className="ch-box disabled">
                                                  <input
                                                    checked={selectedAuthorities.includes(
                                                      data.authorityId,
                                                    )}
                                                    disabled={activeStagePreContract > 4}
                                                    aria-disabled={activeStagePreContract > 4}
                                                    type="checkbox"
                                                    onChange={() =>
                                                      handleAuthorityChange(data.authorityId)
                                                    }
                                                  />
                                                </div>
                                              </li>
                                            ))
                                          : null}
                                    </ul>
                                  </motion.div>
                                ) : null
                              ) : null}
                            </div>

                            <div>
                              <button
                                className="green-button uppercase tracking-wider"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleAdd(user);
                                }}
                                disabled={selectedAuthorities.length === 0}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {userSearchData.length > 0 && (
                  <div className="shared-suggestion-list" ref={suggestionListContainerRef}>
                    <ul>
                      {userSearchData.map((user: UserSearchResult) => (
                        <li key={user.id} onClick={() => handleUserSelection(user)}>
                          <div className="flex items-center">
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
                                <div className="font-bold">
                                  {user.emailId} {user.isExternal ? "(External)" : ""}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
            </div>
            {selectedUsers.length === 0 && isExternalUser && (
              <div className="w-full mb-5">
                <div className="fs14 font-bold mb-5 text-body" ref={addTeamRef}>
                  You are creating an external member
                </div>
                {/* <div className="close-popups-upload drive-folder" onClick={onClose}></div> */}
                <Formik
                  enableReinitialize
                  validationSchema={newMemberSchema}
                  initialValues={formData}
                  onSubmit={(data, actions) => handleSubmit(data, actions)}
                  validate={(values) => FormValidation.validateForm(newMemberSchema, values)}
                >
                  {({ errors, touched, isSubmitting }) => {
                    return (
                      <Form>
                        <div className="from-group">
                          <FormGroup
                            name="userName"
                            type="text"
                            errors={errors}
                            touched={touched}
                            labelText="Name"
                            testIdPrefix="login"
                            formGroupClass="w-full relative"
                            className="input-box"
                            asteriskRequired
                            placeholder="Name"
                          />
                          <FormGroup
                            name="emailId"
                            type="email"
                            errors={errors}
                            touched={touched}
                            labelText="Email Address"
                            testIdPrefix="login"
                            formGroupClass="w-full relative"
                            asteriskRequired
                            className="input-box"
                            placeholder="Email addresses"
                          />
                        </div>
                        <div className="form-group-phone-number from-group">
                          <CountryCodeFormGroup
                            formGroupClass="form-group-country-code"
                            className="countryCode form-control country-code"
                            errors={errors}
                            touched={touched}
                            name="countryCode"
                            labelText="Country Code"
                            options={countryCodeList}
                          />
                          <FormGroup
                            name="phone"
                            type="text"
                            errors={errors}
                            touched={touched}
                            labelText="Phone Number"
                            testIdPrefix="login"
                            formGroupClass="w-full relative"
                            // asteriskRequired
                            className="input-box w-full"
                            placeholder="Phone number"
                          />
                        </div>
                        <div className="w-full flex items-center mb-5 pt-2">
                          <span className="grow"></span>
                          <div className="flex">
                            <button
                              className="green-button uppercase tracking-wider"
                              type="submit"
                              disabled={isSubmitting}
                              aria-disabled={isSubmitting}
                              data-test-id="add-btn"
                            >
                              {"Create"}
                            </button>
                          </div>
                        </div>
                      </Form>
                    );
                  }}
                </Formik>
              </div>
            )}
            {shareUserExternal.length > 0 && (
              <div className="w-full">
                <div className="share-user-info">
                  <p>
                    This file is also shared with{" "}
                    <strong>
                      <span>{shareUserExternal.length} external members </span>
                    </strong>
                  </p>
                </div>
                <div className="shared-user-list">
                  <ul>
                    {shareUserExternal.map((user) => (
                      <li key={user.id}>
                        <div className="flex items-center">
                          <div className="flex items-center fs12">
                            <div className="share-user-img rounded-full">
                              {user.logoUrl ? (
                                <img
                                  src={user.logoUrl}
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
                            </div>
                          </div>
                          <span className="grow"></span>
                          <div className="mr-10 relative show-tooltips btn-status-wrap">
                            <button className="view-button">
                              {user.authority[0].displayName}{" "}
                              {user.authority.length > 1
                                ? "," + "+" + (user.authority.length - 1) + " more"
                                : ""}
                            </button>
                            <div className="dropdown-container">
                              <div className="dropdown-box">
                                <ul>
                                  {user.authority.map((auth, authIndex) => (
                                    <li key={auth.id}>
                                      {authIndex === 0 ? (
                                        <span>{auth.displayName}</span>
                                      ) : (
                                        <span>{auth.displayName}</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="notch"></div>
                            </div>
                          </div>
                          <div>
                            {location?.pathname === `/${ROUTE_ADMIN}/${PRE_CONTRACT}` && (
                              <button
                                className="editIcon-button mr-3"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleEdit(user);
                                }}
                              ></button>
                            )}
                          </div>
                          <div>
                            <button
                              className="remove-button uppercase tracking-wider"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemove(user);
                              }}
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
            )}
            {shareUserInternal.length > 0 && (
              <div className="w-full">
                <br></br>
                <div className="share-user-info">
                  <p>
                    This file is also shared with{" "}
                    <strong>
                      <span>{shareUserInternal.length} internal members </span>
                    </strong>
                  </p>
                </div>
                <div className="shared-user-list">
                  <ul>
                    {shareUserInternal.map((user) => (
                      <li key={user.id}>
                        <div className="flex items-center">
                          <div className="flex items-center fs12">
                            <div className="share-user-img rounded-full">
                              {user.logoUrl ? (
                                <img
                                  src={user.logoUrl}
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
                            </div>
                          </div>
                          <span className="grow"></span>
                          <div className="mr-10 relative show-tooltips btn-status-wrap">
                            <button className="view-button">
                              {user.authority[0].displayName}{" "}
                              {user.authority.length > 1
                                ? "," + "+" + (user.authority.length - 1) + " more"
                                : ""}
                            </button>
                            <div className="dropdown-container">
                              <div className="dropdown-box">
                                <ul>
                                  {user.authority.map((auth, authIndex) => (
                                    <li key={auth.id}>
                                      {authIndex === 0 ? (
                                        <span>{auth.displayName}</span>
                                      ) : (
                                        <span>{auth.displayName}</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="notch"></div>
                            </div>
                          </div>
                          <div>
                            {location?.pathname === `/${ROUTE_ADMIN}/${PRE_CONTRACT}` && (
                              <button
                                className="editIcon-button mr-3"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleEdit(user);
                                }}
                              ></button>
                            )}
                          </div>
                          <div>
                            <button
                              className="remove-button uppercase tracking-wider"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemove(user);
                              }}
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
            )}
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default ShareFileModalPrecontract;
