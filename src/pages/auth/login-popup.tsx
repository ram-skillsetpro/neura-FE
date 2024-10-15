import { GoogleLogin } from "@react-oauth/google";
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import listView from "src/assets/images/list-view.png";
import {
  ROUTE_ADMIN,
  ROUTE_DASHBOARD,
  ROUTE_SIGNUP,
  ROUTE_TEAMS_DRIVE,
  ROUTE_USER_DASHBOARD,
} from "src/const";
import { FormGroup } from "src/core/components/form/FormGroup";
import { PasswordFormGroup } from "src/core/components/form/PasswordFormGroup";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { FormValidation } from "src/core/services/form-validation.service";
import { USER_EMAIL_REGEX } from "src/core/utils/constant";
import { object, string } from "yup";
import { LoginPayload } from "./auth.model";
import { forgetPassword, googleAuth, login } from "./auth.redux";

export interface LoginPopupProps {
  onClose: () => void;
}

interface FormData extends LoginPayload {}

const LoginPopup: React.FC<LoginPopupProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loginSchema = object().shape({
    emailId: string().required().email().matches(USER_EMAIL_REGEX),
    password: string().required(),
  });
  const resetPasswordSchema = object().shape({
    emailId: string().required().email().matches(USER_EMAIL_REGEX),
  });
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const authData = JSON.parse(localStorage.getItem("auth") || "{}");
  const defaultPage = authData?.dfp ? authData.dfp : "";

  useEffect(() => {
    // if (isLoggedIn) navigate(`${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}`);
    if (isLoggedIn) {
      if (authData?.ef && authData?.ev) {
        if (defaultPage === "dashboard") {
          navigate(`${ROUTE_ADMIN}/${ROUTE_DASHBOARD}`);
        } else if (defaultPage === "mydrive") {
          navigate(`${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}`);
        } else {
          navigate(`${ROUTE_ADMIN}/${ROUTE_TEAMS_DRIVE}`);
        }
      }
    }
    // if (isLoggedIn) navigate(`${ROUTE_ADMIN}/${ROUTE_CONTRACT_LIST}`);
    // TODO: handle for isLoggedIn returns false
  }, [isLoggedIn]);

  const [isResetPasswordMode, setResetPasswordMode] = useState(false);

  const handleSubmit = async (data: FormData) => {
    try {
      if (isResetPasswordMode) {
        await dispatch(forgetPassword(data));
      } else {
        await dispatch(login(data));
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  const handleGoogleAuthSuccess = (credentialResponse: any) => {
    dispatch(googleAuth({ credential: credentialResponse.credential }));
  };

  const handleGoogleAuthError = () => {
    console.log("Login Failed");
  };

  // useGoogleOneTapLogin({
  //   onSuccess: (credentialResponse) => {
  //     console.log(credentialResponse);
  //   },
  //   onError: () => {
  //     console.log("Login Failed");
  //   },
  // });

  // const googleLogin = useGoogleLogin({
  //   onSuccess: (tokenResponse) => {
  //     console.log(tokenResponse);
  //     //  dispatch(googleAuth({ credential: credentialResponse.credential }));
  //   },
  // });

  return (
    <div className="popup-container" id="login-popup">
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
                <p></p>
              </div>
            </div>
            <div className="popup-form">
              <div className="popup-form-wrapper">
                <div className="logo"></div>
                <div className="text">
                  <h4>Welcome!</h4>
                  <p>Accelerate contract review and management with Simpleo AI-powered system.</p>
                </div>
                <div className="popup-form-container">
                  <Formik
                    validationSchema={isResetPasswordMode ? resetPasswordSchema : loginSchema}
                    initialValues={{
                      emailId: "",
                      password: "",
                    }}
                    onSubmit={async (data) => {
                      await handleSubmit(data);
                    }}
                    validate={(values) =>
                      FormValidation.validateForm(
                        isResetPasswordMode ? resetPasswordSchema : loginSchema,
                        values,
                      )
                    }
                    enableReinitialize
                  >
                    {({ errors, touched, isSubmitting }) => {
                      return (
                        <Form>
                          {isResetPasswordMode && (
                            <p className="reset-password-text">
                              Enter your email address to reset your password.
                            </p>
                          )}
                          <FormGroup
                            name="emailId"
                            type="text"
                            errors={errors}
                            touched={touched}
                            labelText="Email Address"
                            testIdPrefix="login"
                          />
                          {!isResetPasswordMode && (
                            <PasswordFormGroup
                              name="password"
                              formGroupClass="add-member-input"
                              errors={errors}
                              touched={touched}
                              labelText={isResetPasswordMode ? "Email Address" : "Password"}
                              testIdPrefix="login"
                            />
                          )}
                          <p className="controls mt-3">
                            {!isResetPasswordMode && (
                              <>
                                <span className="remember">
                                  <input
                                    type="checkbox"
                                    name="remember"
                                    id="remember"
                                    tabIndex={3}
                                  />
                                  <label className="checkbox-label" htmlFor="remember">
                                    Remember Me
                                  </label>
                                </span>
                                <span className="forgot-password">
                                  <a href="#" onClick={() => setResetPasswordMode(true)}>
                                    {isResetPasswordMode ? "Submit" : "Forgot Password"}
                                  </a>
                                </span>
                              </>
                            )}
                          </p>
                          <button
                            type="submit"
                            data-test-id="login-btn"
                            className="btn"
                            disabled={isSubmitting}
                          >
                            {isResetPasswordMode ? "Submit" : "Login"}
                          </button>
                        </Form>
                      );
                    }}
                  </Formik>
                  <div className="mt-3">
                    <GoogleLogin
                      width="360px"
                      onSuccess={handleGoogleAuthSuccess}
                      onError={handleGoogleAuthError}
                    />
                  </div>
                </div>
                <div className="text">
                  <p>
                    Don't have an account?&nbsp;
                    <Link to={ROUTE_SIGNUP}>Sign Up</Link>
                    &nbsp;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
