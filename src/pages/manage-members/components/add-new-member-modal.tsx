import { CountryCodeFormGroup } from "core/components/form/CountryCodeFormGroup";
import { FormGroup } from "core/components/form/FormGroup";
import AppModal from "core/components/modals/app-modal";
import { AppModalType } from "core/components/modals/app-modal.model";
import { useAppDispatch, useAppSelector } from "core/hook";
import { FormValidation } from "core/services/form-validation.service";
import { getShortUsername, getUsernameColor } from "core/utils";
import { PHONE_NUMBER_REGEX, USER_EMAIL_REGEX } from "core/utils/constant";
import { useAuthorityCheck } from "core/utils/use-authority-check.hook";
import { Form, Formik, FormikHelpers } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import {
  CountryCodeType,
  CreateNewMemberPayload,
  MembersType,
} from "pages/manage-members/manage-members.model";
import {
  createNewMember,
  getAllMembersPerpage,
  getCountryCodeList,
  membersFetchedPerPage,
  membersFetchedSuccess,
} from "pages/manage-members/manage-members.redux";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { USER_AUTHORITY } from "src/const";
import { object, string } from "yup";
import "./add-new-member-modal.scss";

interface IAddNewMemberModal extends AppModalType {
  isOpen: boolean;
  onClose: () => void;
  onAfterClose: () => void;
  team: { teamName: string; teamDescription: string; id: number; teamId: number };
}
const initialState = {
  emailId: "",
  phone: "",
  userName: "",
  countryCode: "+91",
};
const AddNewMemberModal: React.FC<IAddNewMemberModal> = ({
  isOpen,
  onClose,
  onAfterClose,
  shouldCloseOnOverlayClick,
}) => {
  // console.log(team);
  const addTeamRef = useRef<HTMLDivElement | null>(null);
  const isAdmin = useAuthorityCheck([
    USER_AUTHORITY.COMPANY_SUPER_ADMIN,
    USER_AUTHORITY.COMPANY_TEAM_ADMIN,
  ]);
  const [formData, setFormData] = useState(initialState);
  const navigateTo = useNavigate();
  const roleSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);

  const [isEdit, setIsEdit] = useState(false);
  const [countryCodeList, setCountryCodeList] = useState<Array<CountryCodeType>>([]);
  const members = useAppSelector((state) => state.manageMembers.members);
  const currentPage = useAppSelector((state) => state.manageMembers.membersData.pgn);
  const totalItems = useAppSelector((state) => state.manageMembers.membersData.totct);
  const itemsPerPage = useAppSelector((state) => state.manageMembers.membersData.perpg);
  const isLoading = useAppSelector((state) => state.manageMembers.isLoading);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const dispatch = useAppDispatch();
  const editMember = (member: MembersType) => {
    setIsEdit(true);
    setFormData({
      ...member,
      countryCode: member.countryCode || "+91",
    });
    if (addTeamRef.current) {
      addTeamRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleEditMember = (member: MembersType) => {
    editMember(member);
  };

  const newMemberSchema = object().shape({
    emailId: string().required().email().matches(USER_EMAIL_REGEX),
    phone: string().matches(PHONE_NUMBER_REGEX, "Enter valid number"),
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
    try {
      const response = await dispatch(createNewMember(data));
      if (response?.isSuccess) {
        await dispatch(getAllMembersPerpage(1));
      }
    } catch (error) {
      console.log(error);
    } finally {
      actions.resetForm();
      setFormData(initialState);
      if (isEdit) {
        setIsEdit((prevState) => !prevState);
      }
    }
  };

  const handleLoadMore = (page: number) => {
    dispatch(getAllMembersPerpage(page));
  };

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
    return () => {
      dispatch(membersFetchedSuccess([]));
      dispatch(
        membersFetchedPerPage({
          totct: 0,
          pgn: 1,
          perpg: 10,
          result: [],
        }),
      );
    };
  }, []);

  useEffect(() => {
    if (isAdmin) dispatch(getAllMembersPerpage(currentPage));
  }, [isAdmin]);

  const handleCancelEditMember = () => {
    setFormData(initialState);
    setIsEdit(false);
  };

  const handleUserProfile = (data: number) => {
    const authData = localStorage.getItem("auth");
    let UserCheck, buttonAction;
    if (authData) {
      const parsedAuthData = JSON.parse(authData);
      if (parsedAuthData.profileId === data) {
        UserCheck = true;
        buttonAction = true;
        navigateTo("/admin/settings", {
          state: { showData: UserCheck, buttonAction },
        });
      } else {
        UserCheck = !!roleSuperAdmin;
        buttonAction = false;
        navigateTo("/admin/settings", {
          state: { showData: UserCheck, buttonAction, profileId: data },
        });
      }
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onAfterClose={onAfterClose}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      onClose={onClose}
    >
      <div className="share-outer-wrap">
        <div className="share-inner">
          <div className="w-full mb-5">
            <div className="fs14 font-bold mb-5 text-body" ref={addTeamRef}>
              You are adding a new team member
            </div>
            <div className="close-popups-upload drive-folder" onClick={onClose}></div>
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
                        labelText="Full Name"
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
                    <div className="w-full flex items-center mb-5 border-t pt-2 mt-3">
                      {/* <div className="fs12">This team has {totalItems || 0} member(s)</div> */}
                      <span className="grow"></span>
                      <div className="flex">
                        {isEdit && (
                          <button
                            type="reset"
                            className="remove-button uppercase tracking-wider mr-3"
                            onClick={handleCancelEditMember}
                            data-test-id="cancel-btn"
                          >
                            cancel
                          </button>
                        )}
                        <button
                          className="green-button uppercase tracking-wider"
                          type="submit"
                          disabled={isSubmitting}
                          aria-disabled={isSubmitting}
                          data-test-id="add-btn"
                        >
                          {isEdit ? "Save" : "Add"}
                        </button>
                      </div>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
          <div className="w-full">
            <div className="shared-user-list shared-user-list-scroll">
              <ul>
                {members.map((member) => (
                  <AnimatePresence mode="wait" key={member.id}>
                    <motion.li
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex items-center">
                        <div className="flex items-center fs12">
                          {member.userLogoUrl ? (
                            <div className="share-user-img rounded-full">
                              <img src={member.userLogoUrl} className="rounded-full" />
                            </div>
                          ) : (
                            <div
                              className="share-user-img rounded-full"
                              style={{
                                backgroundColor: member.userLogoUrl
                                  ? "initial"
                                  : getUsernameColor(member.userName) || "",
                              }}
                            >
                              {member.userName !== "" && getShortUsername(member.userName)}
                            </div>
                          )}

                          {member.userName}
                        </div>
                        <span className="grow"></span>
                        <div className="mr-10">
                          <button
                            className="view-button"
                            onClick={() => handleUserProfile(member.id)}
                          >
                            View
                          </button>
                        </div>
                        <div className="mr-10">
                          <button
                            className="editIcon-button"
                            onClick={() => handleEditMember(member)}
                          ></button>
                        </div>
                        <div>
                          <button className="remove-button uppercase tracking-wider">remove</button>
                        </div>
                      </div>
                    </motion.li>
                  </AnimatePresence>
                ))}
              </ul>
              {isLoading ? (
                <div className="flex justify-end mr-4">
                  <div className="simpleO-loader"></div>
                </div>
              ) : currentPage === totalPages ? null : totalPages > 0 ? (
                <div className="flex justify-end">
                  <div
                    className="dataTables_info"
                    id="myTable_info"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="mt-3 mb-2 flex justify-center">
                      <button
                        className={`load-more-btn paginate_button next ${currentPage === totalPages ? "disabled" : ""
                          }`}
                        onClick={() => handleLoadMore(currentPage + 1)}
                      >
                        Load Next
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default AddNewMemberModal;
