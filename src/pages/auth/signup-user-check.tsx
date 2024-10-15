import { GoogleLogin } from "@react-oauth/google";
import { ErrorMessageWrapper } from "core/components/form/ErrorMessage";
import { Field, Form, Formik } from "formik";
import { RegisterCompanyFormType } from "pages/auth/auth.model";
import { useAppDispatch } from "src/core/hook";
import * as Yup from "yup";
import { googleSignupAuth } from "./auth.redux";

const validationSchema = Yup.object().shape({
  userName: Yup.string()
    .min(3, "Full Name must be at least 3 characters")
    .trim()
    .required("Full Name is required"),
  emailId: Yup.string().email("Invalid Email Address").required("Email is required"),
  terms: Yup.boolean().oneOf([true], "You must agree to the terms and conditions"),
});

const SignupUserCheck = ({
  handleCheckSignupUser,
}: {
  handleCheckSignupUser: (
    values: Pick<RegisterCompanyFormType, "userName" | "emailId" | "terms" | "gtk">,
  ) => Promise<void>;
}) => {
  const dispatch = useAppDispatch();

  const initialValues = {
    userName: "",
    emailId: "",
    terms: false,
  };

  const handleSubmit = async (
    values: Pick<RegisterCompanyFormType, "userName" | "emailId" | "terms">,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    try {
      await handleCheckSignupUser(values);
    } catch (error) {
      console.error("Error checking signup user:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuthSuccess = async (credentialResponse: any) => {
    const googleSignupData: any = await dispatch(
      googleSignupAuth({ credential: credentialResponse.credential }),
    );
    const { email, name, gtk } = googleSignupData || {};
    await handleCheckSignupUser({ userName: name, emailId: email, terms: true, gtk });
  };

  const handleGoogleAuthError = () => {
    console.log("Signup Failed");
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form noValidate>
          <div className="form-two-col">
            <div className="col-inner">
              <div
                className={`form-item ${errors.userName && touched.userName ? "error-state" : ""}`}
              >
                <Field
                  type="text"
                  name="userName"
                  className="login-input"
                  placeholder=""
                  id="userName"
                  autoComplete="off"
                />
                <label htmlFor="userName">Full Name</label>
              </div>
              <div
                className={`form-item ${errors.emailId && touched.emailId ? "error-state" : ""}`}
              >
                <Field
                  type="email"
                  name="emailId"
                  className="login-input"
                  id="emailId"
                  placeholder=""
                  autoComplete="off"
                />
                <label htmlFor="emailId">Email Address</label>
              </div>
            </div>
            <div className="col-inner">
              <div className="right-btn-border">
                <div>
                  <GoogleLogin
                    text="signup_with"
                    onSuccess={handleGoogleAuthSuccess}
                    onError={handleGoogleAuthError}
                    width={320}
                  />
                </div>
                <div className="mt-5 help-text">
                  Signup with google only works for Google workspace accounts. Gmail accounts are
                  not supported.
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="sm-text mb-5">
              <Field type="checkbox" name="terms" id="remember" />
              <label className="checkbox-label cursor-pointer" htmlFor="remember">
                I agree to the{" "}
                <a
                  href="https://www.simpleo.ai/legal/terms-conditions"
                  target="_blank"
                  rel="noreferrer"
                  className="link-text"
                >
                  Terms and Conditions
                </a>
              </label>
            </div>
            <div className="mb-3">
              <button
                type="submit"
                className="btn-login font-bold uppercase tracking-wider"
                disabled={isSubmitting}
              >
                Signup
              </button>
            </div>
            <ErrorMessageWrapper name="userName" />
            <ErrorMessageWrapper name="emailId" />
            <ErrorMessageWrapper name="terms" />
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SignupUserCheck;
