import listView from "assets/images/list-view.png";
import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { ROUTE_LOGIN } from "src/const";
import { CountryCodeFormGroup } from "src/core/components/form/CountryCodeFormGroup";
import { FormGroup } from "src/core/components/form/FormGroup";
import { useAppDispatch } from "src/core/hook";
import { FormValidation } from "src/core/services/form-validation.service";
import { PHONE_NUMBER_REGEX, USER_EMAIL_REGEX } from "src/core/utils/constant";
import { boolean, object, string } from "yup";
import { CountryCodeType } from "../manage-members/manage-members.model";
import { getCountryCodeList } from "../manage-members/manage-members.redux";
import { SignUpPayload } from "./auth.model";
import { signUp } from "./auth.redux";
export interface LoginPopupProps {
  onClose: () => void;
}

const SignupPopup: React.FC<LoginPopupProps> = (props) => {
  const signUpSchema = object().shape({
    emailId: string().required().email().matches(USER_EMAIL_REGEX, "Email is not valid"),
    companyName: string().required(),
    userName: string().required(),
    phone: string().required().matches(PHONE_NUMBER_REGEX, "Enter valid number"),
    // password: string().required().matches(PASSWORD_REGEX, { name: "password" }),
    countryCode: string().required(),
    terms: boolean().required().oneOf([true], "You must accept the terms and conditions."),
  });
  const { onClose } = props;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [countryCodeList, setCountryCodeList] = useState<Array<CountryCodeType>>([]);

  const handleSubmit = async (data: Omit<SignUpPayload, "password">) => {
    try {
      const response = await dispatch(signUp(data));
      if (response?.status === 200) {
        navigate(ROUTE_LOGIN);
      }
    } catch (error) {
      console.log(error);
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
  }, []);

  return (
    <>
      {
        <div className="popup-container" id="signup-popup">
          <div className="popup" id="">
            <div className="wrapper">
              <div className="close-popups" onClick={onClose}></div>
              <div className="inner-wrapper">
                <div className="popup-slide">
                  <div className="popup-slide-image">
                    <div className="popup-slide-image-container">
                      <img src={listView} alt="list view preview" />
                    </div>
                  </div>
                  <div className="popup-slide-text">
                    <h3>The Future of Contract Management is here.</h3>
                  </div>
                </div>
                <div className="popup-form">
                  <div className="popup-form-wrapper">
                    <div className="logo"></div>
                    <div className="text">
                      <h4>Signup!</h4>
                    </div>
                    <div className="popup-form-container">
                      <Formik
                        validationSchema={signUpSchema}
                        initialValues={{
                          companyName: "",
                          // password: "",
                          emailId: "",
                          phone: "",
                          userName: "",
                          countryCode: "+91",
                          terms: false,
                        }}
                        onSubmit={(data) => handleSubmit(data)}
                        // FormValidation.validateForm sets error message for FormGroup component
                        // this line is required to use FormGroup component
                        validate={(values) => FormValidation.validateForm(signUpSchema, values)}
                      >
                        {({ errors, touched }) => {
                          return (
                            <Form>
                              <FormGroup
                                name="userName"
                                type="text"
                                errors={errors}
                                touched={touched}
                                labelText="Full Name"
                                testIdPrefix="login"
                              />
                              <FormGroup
                                name="emailId"
                                type="text"
                                errors={errors}
                                touched={touched}
                                labelText="Email Address"
                                testIdPrefix="login"
                              />
                              <div className="form-group-phone-number">
                                <div className="form-group-country-code">
                                  <CountryCodeFormGroup
                                    className="form-control country-code"
                                    errors={errors}
                                    touched={touched}
                                    name="countryCode"
                                    labelText="Country Code"
                                    options={countryCodeList}
                                  />
                                </div>
                                <div className="form-group-number">
                                  <FormGroup
                                    name="phone"
                                    type="text"
                                    errors={errors}
                                    touched={touched}
                                    labelText="Phone Number"
                                    testIdPrefix="login"
                                    formGroupClass="add-member-input"
                                  />
                                </div>
                              </div>
                              {/* <PasswordFormGroup
                                name="password"
                                errors={errors}
                                touched={touched}
                                labelText="Password"
                                testIdPrefix="login"
                                formGroupClass="add-member-input"
                              /> */}
                              <FormGroup
                                name="companyName"
                                type="text"
                                errors={errors}
                                touched={touched}
                                labelText="Company Name"
                                testIdPrefix="login"
                              />
                              <p className="controls mt-3 flex signup-terms">
                                <span className="remember">
                                  <Field type="checkbox" name="terms" id="terms" tabIndex={3} />
                                  <label className="checkbox-label" htmlFor="terms">
                                    I agree to the{" "}
                                    <a
                                      href="https://www.simpleo.ai/legal/terms-conditions"
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Terms and Conditions
                                    </a>
                                  </label>
                                </span>
                                {errors.terms && touched.terms ? (
                                  <div
                                    className="error-message fs-16"
                                    data-test-id="login-error-terms"
                                    style={{ color: "var(--button-red)" }}
                                  >
                                    {errors.terms}
                                  </div>
                                ) : null}
                              </p>
                              <button type="submit" data-test-id="login-btn" className="btn">
                                Signup
                              </button>
                            </Form>
                          );
                        }}
                      </Formik>
                    </div>
                    <div className="text">
                      <p>
                        Already have an account?&nbsp;<Link to={ROUTE_LOGIN}>Login</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </>
  );
};

export default SignupPopup;
