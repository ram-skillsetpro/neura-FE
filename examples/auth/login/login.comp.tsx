import { Form, Formik } from "formik";
import { Component, ReactNode } from "react";
import { connect } from "react-redux";
import { PASSWORD_REGEX } from "src/const";
import { FormGroup } from "src/core/components/form/FormGroup";
import { WithRouterProps, withRouter } from "src/core/hoc/with-routes.hoc";
import { FormValidation } from "src/core/services/form-validation.service";
import { AppDispatch, RootState } from "src/redux/create-store";
import { object, string } from "yup";
import { LoginPayload } from "../auth.model";
import { login } from "../auth.redux";

class Login extends Component<LoginProps, LoginState> {
  private loginSchema = object().shape({
    emailId: string().required().email(),
    password: string()
      .required()
      .matches(PASSWORD_REGEX, { name: "password" }),
  });

  private navigateToHomeIfLoggedIn() {
    if (this.props.isLoggedIn) {
      this.props.router.navigate("/");
    }
  }

  public componentDidMount() {
    this.navigateToHomeIfLoggedIn();
  }

  public componentDidUpdate() {
    this.navigateToHomeIfLoggedIn();
  }

  public login(data: LoginPayload) {
    this.props.login(data);
  }

  render(): ReactNode {
    return (
      <div
        className="d-flex flex-column align-items-center"
        data-test-id="login-page"
      >
        <h1>Login</h1>
        {this.props.errorMessage && (
          <h3 className="invalid-feedback" data-test-id="login-error-message">
            {this.props.errorMessage}
          </h3>
        )}
        <Formik
          validationSchema={this.loginSchema}
          initialValues={{
            emailId: "",
            password: "",
          }}
          onSubmit={(data) => this.login(data)}
          // FormValidation.validateForm sets error message for FormGroup component
          // this line is required to use FormGroup component
          validate={(values) =>
            FormValidation.validateForm(this.loginSchema, values)
          }
        >
          {({ errors, touched }) => {
            return (
              <Form className="w-50">
                <FormGroup
                  name="email"
                  type="text"
                  errors={errors}
                  touched={touched}
                  labelText="Email Address"
                  testIdPrefix="login"
                />
                <FormGroup
                  name="password"
                  type="password"
                  errors={errors}
                  touched={touched}
                  labelText="Password"
                  testIdPrefix="login"
                />
                <button
                  type="submit"
                  className="btn btn-primary mt-4"
                  data-test-id="login-btn"
                >
                  Login
                </button>
              </Form>
            );
          }}
        </Formik>
      </div>
    );
  }
}

export interface LoginState {}

export interface LoginProps
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps>,
    WithRouterProps {}

const mapStateToProps = (state: RootState) => {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    errorMessage: state.auth.login.errorMessage,
  };
};
const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    login: (payload: LoginPayload) => dispatch(login(payload)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Login));
