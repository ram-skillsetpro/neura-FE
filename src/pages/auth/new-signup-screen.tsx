import { useAppDispatch } from "core/hook";
import { AnimatePresence } from "framer-motion";
import { RegisterCompanyFormType } from "pages/auth/auth.model";
import { verifySignupUser } from "pages/auth/auth.redux";
import CompanySignupForm from "pages/auth/company-signup-form";
import SignupUserCheck from "pages/auth/signup-user-check";
import { useState } from "react";
const SignupForm = () => {
  const dispatch = useAppDispatch();
  const [formStep, setFormStep] = useState<"checkSignupUser" | "userSignup" | "companySignup">(
    "checkSignupUser",
  );
  const [userName, setUserName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [gtk, setGtk] = useState("");

  const handleCheckSignupUser = async (
    values: Pick<RegisterCompanyFormType, "userName" | "emailId" | "gtk">,
  ) => {
    try {
      setUserName(values.userName);
      setEmailId(values.emailId);
      values.gtk && setGtk(values.gtk);
      const response = await dispatch(verifySignupUser(values));
      if (response?.emailId) {
        setFormStep("companySignup");
      }
    } catch (error) {
      console.error("Error checking company existence:", error);
    }
  };

  return (
    <div className="tab signup-form" id="signup">
      <AnimatePresence mode="sync">
        <div className="signup-step" id="step1">
          {formStep === "checkSignupUser" && (
            <SignupUserCheck handleCheckSignupUser={handleCheckSignupUser} />
          )}
          {formStep === "companySignup" && (
            <CompanySignupForm userName={userName} emailId={emailId} gtk={gtk} />
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default SignupForm;
