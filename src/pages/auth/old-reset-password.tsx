import { Form, Formik } from "formik";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_ADMIN, ROUTE_LOGIN, ROUTE_USER_DASHBOARD } from "src/const";
import { FormGroup } from "src/core/components/form/FormGroup";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { FormValidation } from "src/core/services/form-validation.service";
import { PASSWORD_REGEX } from "src/core/utils/constant";
import { object, string } from "yup";
import { ForgetPayload, ResetPasswordPayload } from "./auth.model";
import { resetPassword } from "./auth.redux";

interface FormData extends ForgetPayload {}

const ForgetPopup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const forgetSchema = object().shape({
    password: string().required().matches(PASSWORD_REGEX, { name: "password" }),
    cpassword: string().required().matches(PASSWORD_REGEX, { name: "cpassword" }),
  });
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) navigate(`${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}`);
  }, [isLoggedIn]);

  const handleSubmit = (data: FormData, { resetForm }: any) => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const token = urlSearchParams.get("t");
    const payloadData: ResetPasswordPayload = {
      password: data.password,
      cpassword: data.cpassword,
      token: token || "",
    };
    dispatch(resetPassword(payloadData))
      .then(() => {
        resetForm();
      })
      .catch((error) => {
        console.error("Error updating password:", error);
      });
  };

  const redirectToLogin = () => {
    navigate(ROUTE_LOGIN);
  };

  return (
    <>
      {
        <div className="popup-container" id="login-popup">
          <div className="popup" id="">
            <div className="wrapper">
              <div className="close-popups" onClick={redirectToLogin}></div>
              <div className="inner-wrapper">
                <div className="popup-slide">
                  <div className="popup-slide-image"></div>
                </div>
                <div className="popup-form">
                  <div className="popup-form-wrapper">
                    <div className="logo"></div>
                    <div className="text">
                      <p>Reset Your Password</p>
                    </div>
                    <div className="popup-form-container">
                      <Formik
                        validationSchema={forgetSchema}
                        initialValues={{
                          password: "",
                          cpassword: "",
                        }}
                        onSubmit={(data, actions) => handleSubmit(data, actions)}
                        validate={(values) => FormValidation.validateForm(forgetSchema, values)}
                      >
                        {({ errors, touched }) => {
                          return (
                            <Form>
                              <FormGroup
                                name="password"
                                type="password"
                                errors={errors}
                                touched={touched}
                                labelText="Password"
                                testIdPrefix="reset"
                              />
                              <FormGroup
                                name="cpassword"
                                type="password"
                                errors={errors}
                                touched={touched}
                                labelText="Confirm Password"
                                testIdPrefix="reset"
                              />
                              <p className="controls mt-3"></p>
                              <button
                                type="submit"
                                data-test-id="login-btn"
                                className="btn"
                                style={{ width: "310px" }}
                              >
                                Change Password
                              </button>
                            </Form>
                          );
                        }}
                      </Formik>
                    </div>
                    <div className="">
                      <p>
                        <a href="#" onClick={redirectToLogin}>
                          Login
                        </a>
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

export default ForgetPopup;
