import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router";
import ReactSelect, { components } from "react-select";

import { ROUTE_ADMIN, ROUTE_USER_DASHBOARD, USER_AUTHORITY } from "src/const";
import { Loader } from "src/core/components/loader/loader.comp";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import { fetchAllUserList, teamReducer } from "src/pages/manage-team/team.redux";
import { CreateAlertType } from "../alerts.model";
import { createAlert } from "../alerts.redux";
import "./alerts-create.scss";

const initialState: CreateAlertType = {
  alertTitle: "",
  alertCommMedium: 0,
  alertText: "",
  alertFrequency: 0,
  alertStartDate: "",
  alertPriorityLevel: 0,
  alertEndDate: "",
  teamUserIds: [], // Initialize as an empty array
};

const Option = (props: any) => {
  return (
    <div>
      <components.Option {...props}>
        <div>
          <input type="checkbox" checked={props.isSelected} onChange={() => null} />{" "}
          <label style={{ display: "inline-block" }}>{props.label}</label>
        </div>
      </components.Option>
    </div>
  );
};

const validateAlertTitle = (value: string) => {
  let error: string | undefined;
  if (!value) {
    error = "Alert Title is required";
  } else if (value.length > 50) {
    error = "Alert Title should be 50 characters or less";
  }
  return error;
};

const validateAlertText = (value: string) => {
  let error: string | undefined;
  if (!value) {
    error = "Alert Text is required";
  } else if (value.length > 250) {
    error = "Alert Text should be 250 characters or less";
  }
  return error;
};

const validateAlertPriorityLevel = (value: number) => {
  if (value === 0) {
    return "Alert Priority Level is mandatory";
  }
  return null;
};

// Validation function for Alert Frequency
const validateAlertFrequency = (value: number) => {
  if (value === 0) {
    return "Alert Frequency is mandatory";
  }
  return null;
};

const validateAlertCommMedium = (value: number) => {
  if (value === 0) {
    return "Alert Communication Medium is mandatory";
  }
  return null;
};

const validateStartDate = (startDate: string) => {
  if (!startDate) {
    return "Alert Start Date is required";
  }
  return null;
};

// Validation function for End Date
const validateEndDate = (endDate: string, values: CreateAlertType) => {
  if (!endDate) {
    return "Alert End Date is required";
  }
  if (endDate < values.alertStartDate) {
    return "Alert End Date should be greater than the Start Date";
  }
  return null;
};
interface AlertCreateProps {
  fileId: number;
}
const AlertsCreate: React.FC<AlertCreateProps> = ({ fileId }) => {
  const dispatch = useAppDispatch();
  const isAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN, USER_AUTHORITY.ALERT]);
  const { allActiveUserList, isLoading } = useAppSelector((state) => state.team) || {};

  // const userOptions =
  //   allActiveUserList?.map((user) => ({
  //     value: user.id,
  //     label: user.userName,
  //   })) || [];
  const authData = localStorage.getItem("auth");
  const profileId = authData ? JSON.parse(authData).profileId : null;
  const userOptions = [
    {
      value: profileId,
      label: "MySelf",
    },
    // Add the rest of the user options
    ...(allActiveUserList?.map((user) => ({
      value: user.id,
      label: user.userName,
    })) || []),
  ];

  useEffect(() => {
    dispatch(fetchAllUserList());
  }, []);

  const [formData, setFormData] = useState<CreateAlertType>({
    ...initialState,
    teamUserIds: [], // Initialize as an empty array
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (data: CreateAlertType, actions: any) => {
    try {
      // Extract the "value" from the "teamUserIds" array
      const alertTargetValues = data.teamUserIds.map((user: any) => user.value);

      // Now you have an array of "value" from "teamUserIds"
      const formDataToSend = {
        ...data,
        teamUserIds: alertTargetValues,
        alertOnFileId: fileId && fileId,
      };
      dispatch(createAlert(formDataToSend));
      setFormData({
        ...initialState,
        teamUserIds: [],
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      actions.resetForm();
    }
  };

  if (!isAdmin) {
    <Navigate to={`/${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}`} />;
  }

  return (
    <div className="dashboard-viewer">
      {isAdmin && (
        <>
          {isLoading && <Loader />}
          <div className="dashboard-viewer-wrapper">
            <div className="files-container">
              <div className="scroller">
                <div className="centered-form">
                  <Formik
                    enableReinitialize
                    initialValues={formData}
                    onSubmit={(data, actions) => handleSubmit(data, actions)}
                  >
                    {({ errors, touched, isSubmitting }) => {
                      return (
                        <Form>
                          <div className="add-alerts-create">
                            <div className="row">
                              <div className="form-group">
                                <label htmlFor="alertTitle">Alert Title*</label>
                                <Field
                                  type="text"
                                  id="alertTitle"
                                  name="alertTitle"
                                  placeholder="Enter alert title, max 50 characters allowed"
                                  className="form-control alert-form-input"
                                  onChange={handleChange}
                                  value={formData.alertTitle}
                                  validate={validateAlertTitle}
                                />
                                <ErrorMessage name="alertTitle" component="div" className="error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="alertCommMedium">Communication Medium*</label>
                                <Field
                                  as="select"
                                  id="alertCommMedium"
                                  name="alertCommMedium"
                                  className="form-control alert-form-input"
                                  onChange={handleChange}
                                  value={formData.alertCommMedium}
                                  validate={validateAlertCommMedium}
                                >
                                  <option value={0}>Please Select</option>
                                  <option value={1}>InApp</option>
                                  <option value={2}>Mail Alert</option>
                                  {/* <option value={3}>SMS Alert</option> */}
                                </Field>
                                <ErrorMessage
                                  name="alertCommMedium"
                                  component="div"
                                  className="error"
                                />
                              </div>
                            </div>

                            <div className="row">
                              <div className="form-group">
                                <label htmlFor="alertText">Alert Text*</label>
                                <Field
                                  type="text"
                                  id="alertText"
                                  name="alertText"
                                  placeholder="Enter alert text, max 250 characters allowed"
                                  className="form-control alert-form-input"
                                  onChange={handleChange}
                                  value={formData.alertText}
                                  validate={validateAlertText}
                                />
                                <ErrorMessage name="alertText" component="div" className="error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="alertFrequency">Alert Frequency*</label>
                                <Field
                                  as="select"
                                  id="alertFrequency"
                                  name="alertFrequency"
                                  className="form-control alert-form-input"
                                  onChange={handleChange}
                                  value={formData.alertFrequency}
                                  validate={validateAlertFrequency}
                                >
                                  <option value={0}>Please Select</option>
                                  <option value={1}>Start to End Date</option>
                                  <option value={2}>View Once</option>
                                </Field>
                                <ErrorMessage
                                  name="alertFrequency"
                                  component="div"
                                  className="error"
                                />
                              </div>
                            </div>

                            <div className="row">
                              <div className="form-group">
                                <label htmlFor="alertStartDate">Alert Start Date*</label>
                                <Field
                                  type="date"
                                  id="alertStartDate"
                                  name="alertStartDate"
                                  className="form-control alert-form-input"
                                  onChange={handleChange}
                                  value={formData.alertStartDate}
                                  validate={validateStartDate}
                                />
                                <ErrorMessage
                                  name="alertStartDate"
                                  component="div"
                                  className="error"
                                />
                              </div>
                              <div className="form-group">
                                <label htmlFor="alertPriorityLevel">Alert Priority*</label>
                                <Field
                                  as="select"
                                  id="alertPriorityLevel"
                                  name="alertPriorityLevel"
                                  className="form-control alert-form-input"
                                  onChange={handleChange}
                                  value={formData.alertPriorityLevel}
                                  validate={validateAlertPriorityLevel}
                                >
                                  <option value={0}>Please Select</option>
                                  <option value={1}>High Priority</option>
                                  <option value={2}>Medium Priority</option>
                                  <option value={3}>Low Priority</option>
                                </Field>
                                <ErrorMessage
                                  name="alertPriorityLevel"
                                  component="div"
                                  className="error"
                                />
                              </div>
                            </div>

                            <div className="row">
                              <div className="form-group">
                                <label htmlFor="alertEndDate">Alert End Date*</label>
                                <Field
                                  type="date"
                                  id="alertEndDate"
                                  name="alertEndDate"
                                  className="form-control alert-form-input"
                                  onChange={handleChange}
                                  value={formData.alertEndDate}
                                  validate={(endDate: string) => validateEndDate(endDate, formData)}
                                />
                                <ErrorMessage
                                  name="alertEndDate"
                                  component="div"
                                  className="error"
                                />
                              </div>
                              <div className="form-group" style={{ width: "360px" }}>
                                <label htmlFor="teamUserIds">Alert Target Users</label>
                                {/* <Select
                                  name="teamUserIds"
                                  options={userOptions}
                                  value={formData.teamUserIds}
                                  onChange={(selectedOption: any) =>
                                    setFormData({ ...formData, teamUserIds: selectedOption })
                                  }
                                  isMulti
                                  placeholder="Please Select"
                                /> */}
                                <ReactSelect
                                  options={userOptions}
                                  isMulti
                                  closeMenuOnSelect={false}
                                  hideSelectedOptions={false}
                                  components={{
                                    Option,
                                  }}
                                  onChange={(selectedOption: any) =>
                                    setFormData({ ...formData, teamUserIds: selectedOption })
                                  }
                                  value={formData.teamUserIds}
                                  placeholder="Please Select"
                                  styles={{
                                    // Customize the option style
                                    option: (provided) => ({
                                      ...provided,
                                      height: "60px", // Set the height for options
                                      background: "white",
                                      color: "black",
                                    }),
                                    // Customize the checkbox style
                                    // control: (provided) => ({
                                    //   ...provided,
                                    //   height: "20px", // Set the height for checkboxes
                                    // }),
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            aria-disabled={isSubmitting}
                            data-test-id="login-btn"
                            className="btn add-member-btn"
                          >
                            Create Alert
                          </button>
                        </Form>
                      );
                    }}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AlertsCreate;

export const reducer = {
  team: teamReducer,
};
