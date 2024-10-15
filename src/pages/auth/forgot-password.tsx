import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch } from "src/core/hook";
import { LoginPayload } from "./auth.model";
import { forgetPassword } from "./auth.redux";
import "./login.scss";

const ForgotPassword = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");

  const handleEmailChange = (event: any) => {
    setEmail(event.target.value); // Update state with new input value
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const data: LoginPayload = {
      emailId: email,
    };
    try {
      await dispatch(forgetPassword(data));
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  return (
    <div className="login-page">
      <header className="header-login">
        <div className="header-inner">
          <div className="app-logo">
            <a href="#">
              <img
                src="https://simpleo-user-static.s3.us-west-1.amazonaws.com/webassets/images/simpleo-ai-logo.svg"
                alt="SimpleO Logo"
              />
            </a>
          </div>
        </div>
      </header>
      <main className="login-content">
        <div className="user-login-sec" style={{ width: "466px" }}>
          {/* <div className="enterprise-logo">
            <img src={require("assets/images/timeinternet_logo.png")} alt="SimpleO Logo" />
          </div> */}
          <div className="switch-form-tab">
            <ul className="uppercase tracking-wider">
              <li className="active tab" data-tab-target="#login">
                Reset Password
              </li>
            </ul>
          </div>
          <div className="forgot-form">
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-item">
                <input
                  type="email"
                  className="login-input"
                  id="emailAddress"
                  autoComplete="off"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder=" "
                />
                <label htmlFor="emailAddress">Email Address</label>
              </div>
              <div className="btn-wrap justify-between mb-3">
                <div>
                  <button type="submit" className="btn-login font-bold uppercase tracking-wider">
                    Get Reset Link
                  </button>
                </div>
                <div className="sm-text ft">
                  <Link to="/" className="link-text">
                    Back to Login
                  </Link>
                </div>
              </div>
              {/* <div className="error-text">
                Email address is not <strong> registered with simpleo.ai</strong>
              </div> */}
            </form>
          </div>
        </div>
      </main>
      <footer className="footer-login">
        <div>
          &copy; 2024 SimpleO.ai, All Rights Reserved. |{" "}
          <a
            href="https://www.simpleo.ai/legal/privacy-policy"
            target="_blank"
            className="f-link"
            rel="noreferrer"
          >
            Privacy Policy
          </a>{" "}
          |{" "}
          <a
            href="https://www.simpleo.ai/legal/terms-conditions"
            target="_blank"
            className="f-link"
            rel="noreferrer"
          >
            Terms of Service
          </a>{" "}
          |{" "}
          <a
            href="https://www.simpleo.ai/legal/terms-conditions"
            target="_blank"
            className="f-link"
            rel="noreferrer"
          >
            Data Processing Addendum
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPassword;
