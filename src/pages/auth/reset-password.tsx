import { passwordStrength } from "check-password-strength";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTE_ADMIN, ROUTE_USER_DASHBOARD } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { resetPassword } from "./auth.redux";
import "./login.scss";

// type PasswordDetails = {
//   length: number;
//   contains: string[];
// };

const ResetPassword = () => {
  const [strength, setStrength] = useState("Too Weak");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [confirmErrorMessage, setConfirmErrorMessage] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  // const [passwordDetails, setPasswordDetails] = useState<PasswordDetails>({
  //   length: 0,
  //   contains: [],
  // });

  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate(`${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}`);
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const passwordsMatch = newPassword === repeatPassword;
    const isStrongEnough = strength === "Strong" || strength === "Medium";

    setIsButtonDisabled(!(passwordsMatch && isStrongEnough));
  }, [strength, newPassword, repeatPassword]);

  const handlePasswordChange = (e: any) => {
    const password = e.target.value;
    setNewPassword(password);

    const result = passwordStrength(password);

    setStrength(result.value);
    // setPasswordDetails({
    //   length: password.length,
    //   contains: result.contains as string[],
    // });
  };

  const handleRepeatPasswordChange = (e: any) => {
    const repeatPass = e.target.value;
    setRepeatPassword(repeatPass);

    // if (newPassword !== repeatPass) {
    //   setConfirmErrorMessage("Passwords do not match");
    // } else {
    //   setConfirmErrorMessage("");
    // }
  };

  useEffect(() => {
    if (newPassword && repeatPassword && newPassword !== repeatPassword) {
      setConfirmErrorMessage(true);
    } else {
      setConfirmErrorMessage(false);
    }
  }, [newPassword, repeatPassword]);

  // const getBgColorForStrength = (strength: string) => {
  //   switch (strength) {
  //     case "Too weak":
  //       return "red";
  //     case "Medium":
  //       return "blue";
  //     case "Strong":
  //       return "green";
  //     default:
  //       return "#ffdd57";
  //   }
  // };

  const getColorForStrength = (strength: string) => {
    switch (strength) {
      case "Too weak":
        return "#ff6868";
      case "Medium":
        return "#FFB068";
      case "Strong":
        return "#76AA4F";
      default:
        return "#ff6868";
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (newPassword !== repeatPassword) {
      setConfirmErrorMessage(true);
      return;
    }

    const urlSearchParams = new URLSearchParams(window.location.search);
    const token = urlSearchParams.get("t");

    const payloadData = {
      password: newPassword,
      cpassword: repeatPassword,
      token: token || "",
    };

    try {
      const data = await dispatch(resetPassword(payloadData));

      if (data.isSuccess) {
        setNewPassword("");
        setRepeatPassword("");
        setConfirmErrorMessage(false);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Error updating password:", error);
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
          <div className="switch-form-tab">
            <ul className="uppercase tracking-wider">
              <li className="active tab">Choose new Password</li>
            </ul>
          </div>
          <div className="forgot-form">
            <form onSubmit={handleSubmit}>
              <div className="form-item">
                <input
                  type="password"
                  className="login-input"
                  id="newPassword"
                  autoComplete="off"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  placeholder=" "
                />
                <label htmlFor="newPassword">New Password</label>
              </div>
              <div className={`form-item ${confirmErrorMessage ? "error-state" : ""}`}>
                <i
                  className="eye-icon"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    width={24}
                    height={24}
                    src={
                      showRepeatPassword
                        ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFbUlEQVR4nO2cXYhVVRSAv6vTqJmpY1MvUfRjYWWTlZCQUY2FxIRND0pEvWlSEFpB/5P1Ug8R9OCDCf3RQwWBPSRRNDb+RCONmgyjSH8PhfYzZmozI5Ynlq0Ll8GZuefctc/ZM3d9sOAyc+esnzln773WXvuA4ziO4ziO4ziO4ziO4ziOExnTgIXASmA98DnQC/wGHAESlSP6s179znr9mxuBqUU7ESOTgEXAK8Be4GRFMLOKXONb4GXgJtVRt9wCbAQOGQR2LDkIvAHcTJ0wBXgQ2JNDcEeS3cAq4GwmIDOAdcAfBQZ4uIgtLwDnMAE4S++egxEEdiT5HXhSn7ZxyT3ADxEEMqlSvgPuZhxxAfBuBIFLMsqHwPlEzgNAfwTBSgzG7/uJEJlQ3jN2dgjoBJ7XYWgeMFvH/Ub9fJX+rgPYon9jacM7wHQi4Vpgn6Fz32iGNzODLbN08u0xtKcPuJqCuQ8YMHKoB7jT0Laluma2sO1vYDkFUAKeA04ZODEAPApMDmBnA7AGGDSwU3x9hhyR8fFtoztlPzA/B5tbgANGNr+lMQiKLOo3GRm8E2gmP5qAHUa2b9YqY7A0eouRoV8XlPqKzm4jH74I4cO5Ghyr4WIOxXGe4TCyQ29AE6TK9aWRYYPAdRTPfMPV0naLtbaMyZ8ZGZTo6iIW1hr69WktRamScbbXE2gJl5XJhutskQ80ZqlZZ2hEYpyMWHGXsY9SLkid8VkkI5VpdS3codteMpEeV9mn21NLariu3IG7DP2UmK2oVvkio0yqUlZmDMQVQFcV15fJem5GHQ8Z+zqgG8KjcmGAzdKhjAUi2bw9nEKPfHdxBj1SBTxh7PMhjeWIdYGtxgoTLXVmuZPTBLksUgu/PLU2u+VrpXSNNPm/FEBZpgmC6oaLkUSy16In/rK8OFzRbcC/gZQtyzDx1aqzNaXO9kC+/wPcWlYiKeRPgRQlujOSho0GOjek0vh/YT+U/z+W0/RXAypJMtQ19hvolKVf2vpHyBhIjE83CoZU0pjS6WMGOuUaaZgSOAa/kkP3UGNKp48a6DwaWaClSYfXJ+DQ0RfZ0CExPt0s8ldAJfPqfDL8s3In6ZGAipaldHqJgc7bI1neiTxcqWiS4X7acOkg30ytM6KEZduZmuCvDFBMyur4JTqB5JWChyg9DGkn1Rl5IpDCWRmcX5yyj68/Y1GpKUBRSeSxseqzHwdQuopszK1y570z450srA7g76Zqdltma9qYGG9j1UKrriT6NBk5pp83ZJj4KikZb2eJfJ/mCV4YoDNzKfHRZuyjxOyGtEZYL/l2a807Fhr0uF0MQ6R51riGeLCe+F+rxRhZA35kaMwgsIA4erqtGmjKxzFqPjQ6zbDnLtF2LKktFEWzHgxKDHvwzI5ETzde1HcX2OS409CPrhBHL2YYp+ndOd/ZzcZB3h7yZpH/3ifGw0gL4VlgPFxszuOJbNCud8sJcm2gpZ9c83HjGs6beS5TS1rxsmwb26O9cCUj+9qM18mn9Oy4hX2pacvY6JKMIru0TUtKAVkKRKsDpNWH1ddCuTSAY4lW1Lr0LmrXXZA5ugfZqJ+vAe7Vp2troCpcj5Zto2CqvkHG4u0xSSRyUn2K8rVBLcanVpOCZK8W1qJGzmo/HXjDNwkk8kKsp9SHcUOTPnqDEQRwLDmhtW15Bca45WJtIbAs4ljJgJ4auIgJxEyt1/ZGEOAD+nqfIs87BqekrblyJ/2SY3B/1uGhtaiko0hKwPXa+/GVHgKyCuxxLfw8q7WOugvuaEjx/DJNUDr07N427cfr1/aqyhVCv/5OvvO+ni5o12vU9dsbHcdxHMdxHMdxHMdxHMdxiIv/AFyxU2gxdMHCAAAAAElFTkSuQmCC"
                        : "data:image/png;base64,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"
                    }
                    alt={showRepeatPassword ? "Hide Password" : "Show Password"}
                  />
                </i>
                <input
                  type={showRepeatPassword ? "text" : "password"}
                  className="login-input"
                  id="repeatPassword"
                  autoComplete="off"
                  value={repeatPassword}
                  onChange={handleRepeatPasswordChange}
                  placeholder=" "
                />
                <label htmlFor="repeatPassword">Repeat New Password</label>
              </div>
              {/* {confirmErrorMessage && <div className="error-text">{confirmErrorMessage}</div>} */}
              <div className="btn-wrap justify-between mb-3">
                <div>
                  <button
                    className="btn-login font-bold uppercase tracking-wider"
                    disabled={isButtonDisabled}
                  >
                    Save Password
                  </button>
                </div>
                <div className="sm-text ft">
                  <Link to="/" className="link-text">
                    Back to Login
                  </Link>
                </div>
              </div>
              {newPassword && (
                <div className="error-pass-strength-text">
                  <span>
                    Strength value:{" "}
                    <span
                      className="badge font-bold"
                      style={{
                        // backgroundColor: getBgColorForStrength(strength),
                        color: getColorForStrength(strength),
                      }}
                    >
                      {strength}
                    </span>{" "}
                    <br />
                    {/* Password Length: {passwordDetails.length} <br />
                    Contains: {JSON.stringify(passwordDetails.contains)} <br /> */}
                    {/* {repeatPassword && (
                      <div>Match: {confirmErrorMessage ? "Not Matched" : "Matched"}</div>
                    )} */}
                  </span>
                </div>
              )}
              <div className="mt-5 help-text">
                <p
                  className={`${strength === "Too weak" || strength === "Weak" ? "error-text" : ""}`}
                >
                  Passwords must contain at least 10 characters including one number, one special
                  character, and one capital letter.
                </p>
              </div>
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

export default ResetPassword;
