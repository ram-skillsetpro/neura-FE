import { FormGroup } from "core/components/form/FormGroup";
import { Loader } from "core/components/loader/loader.comp";
import { useAppDispatch, useAppSelector } from "core/hook";
import { FormValidation } from "core/services/form-validation.service";
import { PHONE_REGEX, USER_EMAIL_REGEX } from "core/utils/constant";
import { useAuthorityCheck } from "core/utils/use-authority-check.hook";
import { Form, Formik, FormikHelpers } from "formik";
import ManageMemberOption from "pages/manage-members/components/member-option";
import {
  CountryCodeType,
  CreateNewMemberPayload,
  MembersType,
} from "pages/manage-members/manage-members.model";
import {
  createNewMember,
  getAllMembers,
  getCountryCodeList,
  manageMembersReducer,
} from "pages/manage-members/manage-members.redux";
import React, { useEffect, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { ROUTE_ADMIN, ROUTE_USER_DASHBOARD, USER_AUTHORITY } from "src/const";
import { CountryCodeFormGroup } from "src/core/components/form/CountryCodeFormGroup";
import useModal from "src/core/utils/use-modal.hook";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import { object, string } from "yup";
import Modal from "./components/modal/member-details-modal.component";
import "./manage-members.styles.scss";

interface ManageMembersProps {}

const initialState = {
  emailId: "",
  phone: "",
  userName: "",
  countryCode: "+91",
};

type ColumnConfig<T> = {
  key: keyof T | "selector" | "action" | "icon";
  label: string | React.ReactElement;
};

const columns: Array<ColumnConfig<MembersType>> = [
  {
    key: "selector",
    label: (
      <div className="file-item-selector">
        <input type="checkbox" />
      </div>
    ),
  },
  { key: "icon", label: "" },
  { key: "userName", label: "Name" },
  { key: "emailId", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "status", label: "Status" },
  {
    key: "action",
    label: (
      <div className="file-item-controls member-width">
        <p>Action</p>
      </div>
    ),
  },
];
const ManageMembers: React.FC<ManageMembersProps> = () => {
  const dispatch = useAppDispatch();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const isLoading = useAppSelector((state) => state.manageMembers.isLoading);
  const isAdmin = useAuthorityCheck([
    USER_AUTHORITY.COMPANY_SUPER_ADMIN,
    USER_AUTHORITY.COMPANY_TEAM_ADMIN,
  ]);
  const isSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);
  const [formData, setFormData] = useState(initialState);
  const members = useAppSelector((state) => state.manageMembers.members);
  const [countryCodeList, setCountryCodeList] = useState<Array<CountryCodeType>>([]);
  const [memberOption, setMemberOption] = useState(-1);
  const newMemberSchema = object().shape({
    emailId: string().required().email().matches(USER_EMAIL_REGEX),
    phone: string().required().matches(PHONE_REGEX, "Enter valid number"),
    userName: string()
      .required()
      .min(4)
      .max(50)
      .matches(/^[a-zA-Z ]+$/, "Invalid Name"),
    countryCode: string().required(),
  });
  const addTeamRef = useRef<HTMLDivElement | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isShowingModal, toggleModal] = useModal();
  const [memberDetails, setMemberDetails] = useState<MembersType | null>();

  const [searchParams] = useSearchParams();
  const action = searchParams.get("action");

  const handleMemberOption =
    (index: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      setMemberOption(index);
    };

  useEffect(() => {
    if (isAdmin) dispatch(getAllMembers());
  }, [isAdmin]);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
    setFormData(initialState);
    if (isEdit) {
      setIsEdit((prevState) => !prevState);
    }
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
    window.addEventListener("click", () => {
      setMemberOption(-1);
    });
    return () => {
      window.removeEventListener("click", () => {
        setMemberOption(-1);
      });
    };
  }, []);

  const handleSubmit = async (
    data: CreateNewMemberPayload,
    actions: FormikHelpers<CreateNewMemberPayload>,
  ) => {
    try {
      const response = await dispatch(createNewMember(data));
      if (response?.isSuccess) {
        await dispatch(getAllMembers());
      }
    } catch (error) {
      console.log(error);
    } finally {
      actions.resetForm();
      if (isEdit) {
        setIsEdit((prevState) => !prevState);
      }
      setDropdownOpen(!isDropdownOpen);
    }
  };

  const editMember = (member: MembersType) => {
    setDropdownOpen(true);
    setIsEdit(true);
    setFormData({
      ...member,
    });
    if (addTeamRef.current) {
      addTeamRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isAdmin) {
    <Navigate to={`/${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}`} />;
  }

  useEffect(() => {
    if (action === "add-new-member") {
      setDropdownOpen(true);
    }
  }, [action]);

  const data = Array.isArray(members)
    ? members.map((member) => ({
        selector: (
          <div className="file-item-selector">
            <input type="checkbox" />
          </div>
        ),
        icon: (
          <div className="file-item-icon no-padding">
            <span className="icon member">
              <img src={`https://ui-avatars.com/api/?name=${member.userName}`} />
            </span>
          </div>
        ),
        userName: (
          <div className="team-name">
            <div onClick={() => handleCellClick(member)}>{member.userName}</div>
          </div>
        ),
        emailId: member.emailId,
        phone: member.countryCode + "-" + member.phone,
        status: member.status ? "Active" : "InActive",
        action: (
          <div className="file-item-controls member-width">
            <div className="icon control has-dropdown" onClick={handleMemberOption(member.id)}>
              {memberOption === member.id && (
                <ManageMemberOption
                  member={member}
                  setMemberOption={setMemberOption}
                  editMember={editMember}
                />
              )}
            </div>
          </div>
        ),
      }))
    : [];

  const dataTableProps = {
    data,
    columns,
  };

  const handleCellClick = (member?: MembersType) => {
    if (memberDetails) {
      setMemberDetails(null);
    } else {
      setMemberDetails(member);
    }
    toggleModal();
  };

  return (
    <div className="dashboard-viewer">
      {isAdmin && (
        <>
          {isLoading && <Loader />}
          <div className="dashboard-viewer-wrapper">
            <div className="files-container">
              <div className="scroller">
                <div className="files-container-list ">
                  <div className="wrapper nobg list-controls manage-members">
                    {isSuperAdmin && (
                      <div className="list-meta">
                        <p>
                          <a
                            className={`button button-red ${isDropdownOpen ? "opened" : ""}`}
                            id="showaddteam"
                            onClick={toggleDropdown}
                          >
                            {isDropdownOpen ? "Close" : "Add New Member"}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={`files-container-list ${
                    isDropdownOpen ? "add-member-show" : "add-member-hide"
                  }`}
                  id="addmember"
                  ref={addTeamRef}
                >
                  <div className="wrapper nobg">
                    <h3>{isEdit ? "Edit Member" : "Add a Member"}</h3>
                  </div>
                  <div className="wrapper">
                    <div className="app-close-popups" onClick={toggleDropdown}></div>
                    <div className="file-item header-row form-box">
                      <div className="file-item-form">
                        <Formik
                          enableReinitialize
                          validationSchema={newMemberSchema}
                          initialValues={formData}
                          onSubmit={(data, actions) => handleSubmit(data, actions)}
                          validate={(values) =>
                            FormValidation.validateForm(newMemberSchema, values)
                          }
                        >
                          {({ errors, touched, isSubmitting }) => {
                            return (
                              <Form>
                                <div className="form-group-row">
                                  <FormGroup
                                    name="userName"
                                    type="text"
                                    errors={errors}
                                    touched={touched}
                                    labelText="Name"
                                    testIdPrefix="login"
                                    formGroupClass="add-member-input"
                                    asteriskRequired
                                  />
                                  <FormGroup
                                    name="emailId"
                                    type="email"
                                    errors={errors}
                                    touched={touched}
                                    labelText="Email Address"
                                    testIdPrefix="login"
                                    formGroupClass="add-member-input"
                                    asteriskRequired
                                  />
                                </div>
                                <div className="form-group-row">
                                  <div className="form-group-phone-number">
                                    <CountryCodeFormGroup
                                      formGroupClass="form-group-country-code custom-select"
                                      className="form-control country-code"
                                      errors={errors}
                                      touched={touched}
                                      name="countryCode"
                                      labelText="Country Code"
                                      options={countryCodeList}
                                    />
                                    <div className="form-group-number">
                                      <FormGroup
                                        name="phone"
                                        type="text"
                                        errors={errors}
                                        touched={touched}
                                        labelText="Phone Number"
                                        testIdPrefix="login"
                                        formGroupClass="add-member-input"
                                        asteriskRequired
                                      />
                                    </div>
                                  </div>
                                  <div className="add-member-btn-container">
                                    <button
                                      type="submit"
                                      disabled={isSubmitting}
                                      aria-disabled={isSubmitting}
                                      data-test-id="login-btn"
                                      className="button button-red add-member-btn"
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
                    </div>
                  </div>
                </div>
                <div className="files-container-list">
                  <div className="wrapper nobg">
                    <h3>{members.length} Members</h3>
                  </div>
                  <DataTable {...dataTableProps} className="member-table" />
                </div>
              </div>
            </div>
          </div>
          {memberDetails && (
            <Modal
              show={isShowingModal}
              onCloseButtonClick={handleCellClick}
              member={memberDetails}
            />
          )}
        </>
      )}
    </div>
  );
};

export const reducer = {
  manageMembers: manageMembersReducer,
};

export default ManageMembers;
