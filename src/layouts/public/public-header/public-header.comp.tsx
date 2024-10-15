import MFAModal from "core/components/modals/mfa-modal/mfa-modal";
import useModal from "core/utils/use-modal.hook";
import { ContentCase } from "pages/auth/auth.model";
import { Suspense, lazy, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import VerifyEmailModal from "src/core/components/modals/verify-email-modal/verify-email-modal";
import { useAppSelector } from "src/core/hook";
import { getAuth } from "src/core/utils";
import CreatePasswordPopup from "src/pages/auth/create-password";
import "./public-header.comp.scss";

const LoginPopup = lazy(
  () => import(/* webpackChunkName: "login-popup" */ "src/pages/auth/login-popup"),
);
const SignupPopup = lazy(
  () => import(/* webpackChunkName: "public-header" */ "src/pages/auth/signup-popup"),
);
const ResetPasswordPopup = lazy(
  () => import(/* webpackChunkName: "reset-popup" */ "src/pages/auth/reset-password"),
);

const PublicHeader = () => {
  const navigate = useNavigate();
  const [showResetPasswordPopup, setResetPasswordPopup] = useState<boolean>(true);
  const [emailVerify, setEmailVerify] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const actionValue = searchParams.get("action");
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const mfaCase = useAppSelector((state) => state.auth.mfaCase);
  const mfaData = useAppSelector((state) => state.auth.mfaData);

  const authData = JSON.parse(localStorage.getItem("auth") || "{}");
  const [isMFAEnabled, toggleMFAEnabled] = useModal();

  useEffect(() => {
    if (mfaCase === ContentCase.VerifyCode || mfaCase === ContentCase.ScanQRCode) {
      toggleMFAEnabled();
    }
  }, [mfaCase, mfaData]);

  useEffect(() => {
    const isVerifyEmailAction =
      searchParams.has("action") && searchParams.get("action") === "verify-email";
    if ((isLoggedIn && (authData?.ev === false || authData?.ef === false)) || isVerifyEmailAction) {
      if (isVerifyEmailAction) {
        localStorage.clear();
        sessionStorage.clear();
      }
      setEmailVerify(true);
    }
  }, [isLoggedIn, authData]);

  const handleLoginButtonClick = () => {
    searchParams.set("action", "login");
    setSearchParams(searchParams);
  };

  const handleSignupButtonClick = () => {
    searchParams.set("action", "signup");
    setSearchParams(searchParams);
  };

  const handleClosePopups = () => {
    if (searchParams.has("action")) {
      searchParams.delete("action");
      setSearchParams(searchParams);
    }
    setResetPasswordPopup(false);
  };

  const urlSearchParams = new URLSearchParams(window.location.search);
  if (urlSearchParams.has("action") && urlSearchParams.get("action") === "reset-password") {
    return <Suspense>{showResetPasswordPopup && <ResetPasswordPopup />}</Suspense>;
  }

  const auth = getAuth();

  useEffect(() => {
    if (JSON.stringify(auth) !== '{}') {
      console.log(auth)
      navigate("/admin/dashboard");
    }
  }, []);

  return (
    <>
      {isMFAEnabled ? (
        <MFAModal
          isOpen={isMFAEnabled}
          onClose={() => {
            toggleMFAEnabled();
            localStorage.removeItem("token");
          }}
          shouldCloseOnOverlayClick={true}
          mfaCase={mfaCase}
          mfaData={mfaData}
        />
      ) : emailVerify ? (
        <VerifyEmailModal
          isOpen={true}
          onClose={() => { }}
          eula={authData?.ef === false ? !authData.ef : false}
          ev={authData?.ev}
        />
      ) : (
        <>
          <div className="navigation">
            <nav>
              <div className="logo-navigation">
                <a className="logo">&nbsp;</a>
              </div>
              <div className="page-navigation">
                <ul>
                  <li>
                    <a href="https://simpleo.ai/product">Product</a>
                  </li>

                  <li>
                    <a href="https://simpleo.ai/about">About Us</a>
                  </li>
                  <li>
                    <a href="https://simpleo.ai/trustCenter">Trust Center</a>
                  </li>
                </ul>
              </div>
              <div className="account-navigation">
                <ul>
                  <li>
                    <a
                      className="button button-flat"
                      id="loginbutton"
                      onClick={handleLoginButtonClick}
                    >
                      Login
                    </a>
                  </li>
                  <li>
                    <a
                      className="button button-red"
                      id="signupbutton"
                      onClick={handleSignupButtonClick}
                    >
                      SignUp
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
          </div>

          <Suspense>
            {actionValue === "login" && <LoginPopup onClose={() => handleClosePopups()} />}

            {actionValue === "signup" && <SignupPopup onClose={() => handleClosePopups()} />}

            {actionValue === "create-password" && <CreatePasswordPopup />}
          </Suspense>
        </>
      )}
    </>
  );
};

export default PublicHeader;
