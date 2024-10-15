import ExistingUserForm from "pages/auth/existing-user-form";
import SignupForm from "pages/auth/new-signup-screen";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./login.scss";

const LoginScreen = () => {
  const [tabPressed, setTabPressed] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/register") {
      setActiveTab("signup");
    } else if (location.pathname === "/") {
      setActiveTab("login");
    }
  }, [location]);

  return (
    <div className="login-page">
      <header className="header-login">
        <div className="header-inner">
          <div className="app-logo">
            <Link to="https://www.simpleo.ai/">
              <img
                src="https://simpleo-user-static.s3.us-west-1.amazonaws.com/webassets/images/simpleo-ai-logo.svg"
                alt="SimpleO Logo"
              />
            </Link>
          </div>
        </div>
      </header>
      <main className="login-content">
        <div className="user-login-sec">
          <div className="switch-form-tab">
            <ul className="uppercase tracking-wider">
              <li
                className={activeTab === "login" ? "active tab" : "tab"}
                onClick={() => {
                  setActiveTab("login");
                  setTabPressed(true);
                  navigate("/");
                }}
              >
                Login
              </li>
              <li
                className={activeTab === "signup" ? "active tab" : "tab"}
                onClick={() => {
                  setActiveTab("signup");
                  setTabPressed(true);
                  navigate("/register");
                }}
              >
                Signup
              </li>
            </ul>
          </div>
          {activeTab === "login" && <ExistingUserForm tabPressed={tabPressed} />}
          {activeTab === "signup" && <SignupForm />}
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

export default LoginScreen;
