import { useAppDispatch } from "core/hook";
import { useCountryCodeList } from "core/utils/use-countrycodelist";
import { useFormik } from "formik";
import { motion } from "framer-motion";
import { RegisterCompanyFormType } from "pages/auth/auth.model";
import { registerCompanyLogo, signUp, uploadCompanyLogo } from "pages/auth/auth.redux";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";

const validationSchema = Yup.object({
  companyName: Yup.string().required("Company Name is required"),
  website: Yup.string()
    .matches(/^https?:\/\/.+/, 'URL must start with "http://" or "https://"')
    .url("Enter a valid URL")
    .required("Website URL is required"),
  userName: Yup.string()
    .min(3, "User Name must be at least 3 characters")
    .trim()
    .required("User Name is required"),
  countryCode: Yup.string().required("Country Code is required"),
  phone: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .notRequired(),
  emailId: Yup.string().email("Invalid Email Address").required("Email is required"),
  terms: Yup.boolean().oneOf([true], "You must agree to the Terms and Conditions"),
  dateFormat: Yup.string().required("Date Format is required"),
  logo: Yup.string().required("Logo is required"),
  region: Yup.string().required("Region is required"),
  currency: Yup.string().required("Currency is required"),
});
const CompanySignupForm = ({
  userName,
  emailId,
  gtk,
}: {
  userName: string;
  emailId: string;
  gtk?: string;
}) => {
  const navigate = useNavigate();
  const logoRef = useRef<HTMLInputElement | null>(null);
  const [preSignedUrl, setPreSignedUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const { countryCodeList } = useCountryCodeList();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get("packageId") ? Number(searchParams.get("packageId")) : 0;

  const formik = useFormik<Partial<RegisterCompanyFormType>>({
    initialValues: {
      companyName: "",
      countryCode: "+91",
      currency: "INR",
      dateFormat: "dd/MM/yyyy",
      emailId: "",
      logo: "",
      packageId: 0,
      phone: "",
      region: "AS",
      terms: false,
      userName: "",
      website: "",
      gtk,
      // companyId: 0,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (preSignedUrl && file) {
        await dispatch(uploadCompanyLogo({ url: preSignedUrl, file }));
        const payload = {
          ...values,
          logo: preSignedUrl.split("?")[0],
        };
        const signUpState = await dispatch(signUp(payload));
        if (signUpState) {
          resetForm();
          resetLogoInput();
          navigate("/");
        }
      }
    },
  });

  const resetLogoInput = () => {
    if (logoRef.current) {
      logoRef.current.value = "";
    }
  };

  useEffect(() => {
    userName && userName !== "" && formik.setFieldValue("userName", userName);
    emailId && emailId !== "" && formik.setFieldValue("emailId", emailId);
    packageId && formik.setFieldValue("packageId", packageId);
  }, [userName, emailId, packageId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!formik.values.companyName || String(formik.values.companyName).trim() === "") {
      formik.setFieldTouched("companyName", true);
      formik.setFieldValue("logo", "");
      formik.setFieldError("logo", "");
      resetLogoInput();
    }
    if (file) {
      try {
        const extension = file.name.split(".").pop();
        const url = await dispatch(
          registerCompanyLogo({
            companyId: null,
            extension,
            companyName: formik?.values?.companyName || "",
          }),
        );
        if (url) {
          setFile(file);
          setPreSignedUrl(url as unknown as string);
        }
      } catch (error) {
        console.error("Error uploading logo:", error);
      }
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="signup-first-row">
        <div className="form-two-col">
          <div className="col-inner">
            <div
              className={`form-item ${formik.touched.companyName && formik.errors.companyName ? "error-state" : ""}`}
            >
              <input
                type="text"
                className="login-input"
                placeholder=" "
                id="companyName"
                autoComplete="off"
                {...formik.getFieldProps("companyName")}
              />
              <label htmlFor="companyName">Company Name</label>
            </div>
          </div>
          <div className="col-inner">
            <div
              className={`form-item ${formik.touched.website && formik.errors.website ? "error-state" : ""}`}
            >
              <input
                type="url"
                className="login-input"
                id="website"
                placeholder=" "
                autoComplete="off"
                {...formik.getFieldProps("website")}
              />
              <label htmlFor="website">Website URL</label>
            </div>
          </div>
        </div>
      </div>
      <motion.div
        className="form-two-col"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="col-inner">
          <div className="form-item success">
            <input
              type="text"
              className="login-input"
              placeholder=" "
              id="userName"
              autoComplete="off"
              {...formik.getFieldProps("userName")}
              readOnly
            />
            <label htmlFor="userName">User Name</label>
          </div>
          <div
            className={`form-item ${formik.touched.phone && formik.errors.phone ? "error-state" : ""}`}
          >
            <div className="country-new">
              <select
                className="form-control country-code"
                {...formik.getFieldProps("countryCode")}
              >
                {countryCodeList.map((country, index) => (
                  <option value={country.country_code} key={index}>
                    {country.country_name}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                className="login-input"
                id="phone"
                placeholder=" "
                autoComplete="off"
                {...formik.getFieldProps("phone")}
              />
              <label htmlFor="phone">Phone Number</label>
            </div>
          </div>
          <div className="form-item success">
            <input
              type="email"
              className="login-input"
              id="emailId"
              placeholder=" "
              autoComplete="off"
              {...formik.getFieldProps("emailId")}
              readOnly
            />
            <label htmlFor="emailId">Email Address</label>
          </div>
        </div>
        <div className="col-inner">
          <div className="form-item">
            <div className="form-inner-col">
              <div className="col-inner">
                <select
                  className="custom-selectBox w-full p-2"
                  id="selectCtrl"
                  {...formik.getFieldProps("region")}
                >
                  <option value="AS">Asia</option>
                  <option value="EU">Europe</option>
                  <option value="US">US</option>
                </select>
                <label className="control-label" htmlFor="selectCtrl">
                  Region
                </label>
              </div>
              <div className="col-inner">
                <select
                  className="custom-selectBox w-full p-2"
                  id="selectCtrl"
                  {...formik.getFieldProps("currency")}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
                <label className="control-label" htmlFor="selectCtrl">
                  Currency
                </label>
              </div>
            </div>
          </div>

          <div className="form-item">
            <div className="form-inner-col">
              <div className="col-inner">
                <select
                  className="custom-selectBox w-full p-2"
                  id="selectCtrl"
                  {...formik.getFieldProps("dateFormat")}
                >
                  <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                  <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                  <option value="yyyy/MM/dd">yyyy/MM/dd</option>
                </select>
                <label className="control-label" htmlFor="selectCtrl">
                  Date Format
                </label>
              </div>
            </div>
          </div>
          <div className={`form-item`}>
            <div className={`file-wrap`}>
              <input
                ref={logoRef}
                type="file"
                className="file-upload"
                placeholder=" "
                id="logo"
                accept="image/*"
                onChange={(event) => {
                  formik.setFieldValue("logo", event.currentTarget.files?.[0]?.name || "");
                  handleFileUpload(event);
                }}
              />
            </div>
            <div className="mt-2 help-text">
              Upload company logo in JPEG, JPG, PNG, SVG, or GIF format.
            </div>
          </div>
        </div>
      </motion.div>
      <div>
        <div className="sm-text mb-5">
          <input type="checkbox" id="terms" {...formik.getFieldProps("terms")} />
          <label className="checkbox-label" htmlFor="terms">
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
            className="btn-login font-bold uppercase tracking-wider"
            type="submit"
            disabled={formik.isSubmitting}
          >
            Submit
          </button>
        </div>
      </div>
      {Object.keys(formik.touched).map(
        (field) =>
          field in formik.touched &&
          field in formik.errors && (
            <div key={field} className="error-text">
              <strong>{formik.errors[field as keyof typeof formik.errors]}</strong>
            </div>
          ),
      )}
    </form>
  );
};

export default CompanySignupForm;
