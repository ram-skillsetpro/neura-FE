import { CountryCodeFormGroup } from "core/components/form/CountryCodeFormGroup";
import { FormGroup } from "core/components/form/FormGroup";
import AppModal from "core/components/modals/app-modal";
import { AppModalType } from "core/components/modals/app-modal.model";
import { useAppDispatch } from "core/hook";
import { FormValidation } from "core/services/form-validation.service";
import { PHONE_REGEX, USER_EMAIL_REGEX } from "core/utils/constant";
import { useAuthorityCheck } from "core/utils/use-authority-check.hook";
import { Form, Formik, FormikHelpers } from "formik";
import { CountryCodeType, CreateNewMemberPayload } from "pages/manage-members/manage-members.model";
import {
  clearMembersData,
  createNewMember,
  getAllMembersPerpage,
  getCountryCodeList,
} from "pages/manage-members/manage-members.redux";
import React, { useEffect, useRef, useState } from "react";
import { USER_AUTHORITY } from "src/const";
import { object, string } from "yup";
import "./add-new-member-modal.scss";

interface IAddNewMemberModal extends AppModalType {
  isOpen: boolean;
  onClose: () => void;
}
const initialState = {
  emailId: "",
  phone: "",
  userName: "",
  countryCode: "+91",
};
const AddNewUser: React.FC<IAddNewMemberModal> = ({
  isOpen,
  onClose,
  shouldCloseOnOverlayClick,
}) => {
  const addTeamRef = useRef<HTMLDivElement | null>(null);
  const isAdmin = useAuthorityCheck([
    USER_AUTHORITY.COMPANY_SUPER_ADMIN,
    USER_AUTHORITY.COMPANY_TEAM_ADMIN,
  ]);
  const [formData, setFormData] = useState(initialState);
  const [isEdit, setIsEdit] = useState(false);
  const [countryCodeList, setCountryCodeList] = useState<Array<CountryCodeType>>([]);

  const dispatch = useAppDispatch();

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
    try {
      const response = await dispatch(createNewMember(data));
      if (response?.isSuccess) {
        await dispatch(clearMembersData());
        await dispatch(getAllMembersPerpage(1));
        onClose();
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
    // return () => {
    //   dispatch(membersFetchedSuccess([]));
    // };
  }, []);

  useEffect(() => {
    // if (isAdmin) dispatch(getAllMembersPerpage(currentPage));
  }, [isAdmin]);

  const handleCancelEditMember = () => {
    setFormData(initialState);
    setIsEdit(false);
  };

  return (
    <AppModal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      onClose={onClose}
    >
      <div className="share-outer-wrap">
        <div className="share-inner">
          <div className="w-full mb-5">
            <div className="fs14 font-bold mb-5 text-body" ref={addTeamRef}>
              You are adding a new team member
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
                    <div className="w-full flex items-center mb-5 border-t pt-2 mt-3">
                      <span className="grow"></span>
                      <div className="flex">
                        <button
                          className="green-button uppercase tracking-wider  mr-3"
                          type="submit"
                          disabled={isSubmitting}
                          aria-disabled={isSubmitting}
                          data-test-id="add-btn"
                        >
                          {isEdit ? "Save" : "Add"}
                        </button>
                        <button
                          type="reset"
                          className="remove-button uppercase tracking-wider mr-3"
                          onClick={onClose}
                          data-test-id="cancel-btn"
                        >
                          cancel
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
    </AppModal>
  );
};

export default AddNewUser;
