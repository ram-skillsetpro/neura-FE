import { PasswordFormGroup } from "core/components/form/PasswordFormGroup";
import { useAppDispatch, useAppSelector } from "core/hook";
import { FormValidation } from "core/services/form-validation.service";
import { PASSWORD_REGEX } from "core/utils/constant";
import { Form, Formik } from "formik";
import { ForgetPayload, ResetPasswordPayload } from "pages/auth/auth.model";
import { resetPassword } from "pages/auth/auth.redux";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import listView from "src/assets/images/list-view.png";
import { ROUTE_ADMIN, ROUTE_LOGIN, ROUTE_USER_DASHBOARD } from "src/const";
import { object, string } from "yup";

interface FormData extends ForgetPayload {}

const CreatePasswordPopup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const forgetSchema = object().shape({
    password: string().required().matches(PASSWORD_REGEX, { name: "password" }),
    cpassword: string()
      .required()
      .test("cpassword", function (value) {
        return this.parent.password === value;
      }),
  });
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) navigate(`${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}`);
  }, [isLoggedIn]);

  const handleSubmit = async (data: FormData) => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const token = urlSearchParams.get("t");
    const payloadData: ResetPasswordPayload = {
      password: data.password,
      cpassword: data.cpassword,
      token: token || "",
    };
    const result = await dispatch(resetPassword(payloadData));
    if (result.isSuccess) {
      redirectToLogin();
    }
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
                  <div className="popup-slide-image">
                    <div className="popup-slide-image-container">
                      <img src={listView} alt="list view preview" />
                    </div>
                  </div>
                </div>
                <div className="popup-form">
                  <div className="popup-form-wrapper">
                    <div className="logo"></div>
                    <div className="text">
                      <h4>Welcome!</h4>
                      <p>
                        Accelerate contract review and management with Simpleo AI-powered system.
                      </p>
                    </div>
                    <div className="popup-form-container">
                      <Formik
                        validationSchema={forgetSchema}
                        initialValues={{
                          password: "",
                          cpassword: "",
                        }}
                        onSubmit={(data) => handleSubmit(data)}
                        validate={(values) => FormValidation.validateForm(forgetSchema, values)}
                      >
                        {({ errors, touched }) => {
                          return (
                            <Form>
                              <PasswordFormGroup
                                name="password"
                                errors={errors}
                                touched={touched}
                                labelText="Password"
                                testIdPrefix="create-password"
                                formGroupClass="add-member-input"
                              />
                              <PasswordFormGroup
                                name="cpassword"
                                errors={errors}
                                touched={touched}
                                labelText="Confirm Password"
                                testIdPrefix="create-password"
                                formGroupClass="add-member-input"
                              />
                              <p className="controls mt-3"></p>
                              <button type="submit" data-test-id="login-btn" className="btn">
                                Submit
                              </button>
                            </Form>
                          );
                        }}
                      </Formik>
                    </div>
                    <div className="">
                      <p>
                        <Link to={ROUTE_LOGIN}>Login</Link>
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

export default CreatePasswordPopup;
