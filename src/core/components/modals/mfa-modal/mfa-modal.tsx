import { FormGroup } from "core/components/form/FormGroup";
import { LoaderSection } from "core/components/loader/loaderSection.comp";
import AppModal from "core/components/modals/app-modal";
import { AppModalType } from "core/components/modals/app-modal.model";
import { useAppDispatch } from "core/hook";
import { Form, Formik } from "formik";
import {
  adminProfileList,
  generateMFACodes,
  verifyTOTP,
} from "pages/admin-setting/settings-auth.redux";
import { ContentCase, GeneratedQRCodeType, MfaLogin } from "pages/auth/auth.model";
import React, { useEffect } from "react";
import { verifyLoginTOTP } from "src/pages/auth/auth.redux";
import { object, string } from "yup";
import "./mfa-modal.scss";
interface MFAModalType extends AppModalType {
  mfaCase?: ContentCase;
  mfaData?: MfaLogin;
}

const MFAModal: React.FC<MFAModalType> = ({
  isOpen,
  onClose,
  shouldCloseOnOverlayClick,
  mfaCase,
  mfaData,
}) => {
  const dispatch = useAppDispatch();
  const [authCodes, setAuthCodes] = React.useState<GeneratedQRCodeType>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentCase, setCurrentCase] = React.useState<ContentCase>(ContentCase.ScanQRCode);
  const [, setHistoryStack] = React.useState<ContentCase[]>([ContentCase.ScanQRCode]);
  const handleShowSetupKey = () => {
    setHistoryStack((prev) => [...prev, ContentCase.EnterSetupKey]);
    setCurrentCase(ContentCase.EnterSetupKey);
  };

  const handleShowVerifyCode = () => {
    setHistoryStack((prev) => [...prev, ContentCase.VerifyCode]);
    setCurrentCase(ContentCase.VerifyCode);
  };

  const handleBack = () => {
    setHistoryStack((prev) => {
      const newStack = prev.slice(0, -1);
      const previousCase = newStack[newStack.length - 1] || ContentCase.ScanQRCode;
      setCurrentCase(previousCase);
      return newStack;
    });
  };

  useEffect(() => {
    if (mfaCase === ContentCase.VerifyCode) {
      handleShowVerifyCode();
    } else if (mfaCase === ContentCase.ScanQRCode) {
      setAuthCodes(mfaData?.mfaTokenData);
    } else {
      getMFACodes();
    }
  }, [mfaCase]);

  const getMFACodes = async () => {
    setIsLoading(true);
    try {
      const resp = await dispatch(generateMFACodes());
      if (resp) {
        setAuthCodes(resp.data);
      }
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const totpSchema = object().shape({
    totp: string()
      .required("Code is required")
      .test("is-valid-code", "Enter Valid 6 digits code", (value) => {
        return /^\d{6}$/.test(value || "");
      }),
  });

  const handleSubmit = async (data: { totp: string }) => {
    try {
      setIsLoading(true);
      if (mfaData && mfaData.token) {
        const res = await dispatch(verifyLoginTOTP({ ...data, token: mfaData.token }));
        if (res?.data && "response" in res.data && res.data.response === false) {
          // onClose?.();
          // TODO: do something when authentication fails
        }
      } else {
        const res = await dispatch(verifyTOTP(data));
        if (onClose && !!res) {
          onClose();
          dispatch(adminProfileList());
        }
      }
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      overlayClassName={mfaData?.token ? "modal-overlay-gray" : "modal-overlay"}
    >
      <div className="pop-outer-wrap p-0">
        <div className="mfa-heading-bg bder-b">
          <div className="fs14 font-bold text-body">Multi-factor Authentication</div>
        </div>

        {currentCase === ContentCase.EnterSetupKey && (
          <>
            <div className="mfa-content-body">
              <div className="list">
                <ul>
                  <li>
                    In the Google Authenticator app, tap the <strong>+</strong> then tap{" "}
                    <strong>Enter a setup key</strong>
                  </li>
                  <li>
                    Enter your email address and this key (spaces don&apos;t matter):
                    <div>
                      <strong>{authCodes?.mfaCode}</strong>
                    </div>
                  </li>
                  <li>
                    Make sure that <strong>Time based</strong> is selected
                  </li>
                  <li>
                    Tap <strong>Add</strong> to finish
                  </li>
                </ul>
              </div>
            </div>
            <div className="mfa-footer-bg">
              <div className="flex justify-between pt-3">
                <button className="link-btn" onClick={handleBack}>
                  Back
                </button>
                <div className="flex">
                  <button className="remove-button uppercase tracking-wider mr-3" onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    className="green-button uppercase tracking-wider"
                    // type="submit"
                    aria-disabled="false"
                    data-test-id="add-btn"
                    onClick={handleShowVerifyCode}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {currentCase === ContentCase.ScanQRCode && (
          <>
            <div className="mfa-content-body">
              <div className="list">
                <ul>
                  <li>
                    In the Google authenticator app, tap the <strong>+</strong> button
                  </li>
                  <li>
                    Choose <strong>Scan a QR code</strong>
                  </li>
                </ul>
              </div>
              <div className="qr-code-wrap flex items-center justify-center h-full flex-column">
                {isLoading ? (
                  <LoaderSection />
                ) : authCodes?.qrCode ? (
                  <>
                    <img src={authCodes?.qrCode} />
                    <button className="link-btn" onClick={handleShowSetupKey}>
                      Can&apos;t scan it?
                    </button>
                  </>
                ) : null}
              </div>
            </div>
            <div className="mfa-footer-bg">
              <div className="flex justify-end pt-3">
                <button className="remove-button uppercase tracking-wider mr-3" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="green-button uppercase tracking-wider"
                  // type="submit"
                  aria-disabled="false"
                  data-test-id="add-btn"
                  onClick={handleShowVerifyCode}
                >
                  Add
                </button>
              </div>
            </div>
          </>
        )}
        {currentCase === ContentCase.VerifyCode && (
          <Formik
            enableReinitialize
            validationSchema={totpSchema}
            initialValues={{
              totp: "",
            }}
            onSubmit={async (data) => {
              await handleSubmit(data);
            }}
          >
            {({ errors, touched, values, setTouched, setValues, isSubmitting, submitForm }) => {
              const handleKeyPress = (event: React.KeyboardEvent<HTMLFormElement>) => {
                if (event.key === "Enter" && values.totp.length === 6) {
                  submitForm();
                }
              };
              return (
                <Form
                  onKeyDown={async (event: React.KeyboardEvent<HTMLFormElement>) => {
                    setTouched({ ...touched, totp: true });
                    event.key === "Enter" && event.preventDefault();
                    handleKeyPress(event);
                  }}
                >
                  <div className="mfa-content-body">
                    <FormGroup
                      name="totp"
                      type="text"
                      inputMode="numeric"
                      minLength={6}
                      maxLength={6}
                      errors={errors}
                      touched={touched}
                      labelText="Enter the 6-digit code that you received in your authenticator app"
                      testIdPrefix="login"
                      className="mt-2 mb-2"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setValues({ ...values, totp: e.target.value.replace(/[^0-9]/g, "") });
                      }}
                    />
                    {mfaData?.token && (
                      <div className="font-bold fs12 text-light-color lh3">
                        For assistance, please contact your Company Administrator.
                      </div>
                    )}
                  </div>
                  <div className="mfa-footer-bg">
                    <div className="flex justify-between pt-3">
                      <div>
                        {!mfaData?.token && !mfaData?.mfaTokenData && (
                          <button className="link-btn" onClick={handleBack}>
                            Back
                          </button>
                        )}
                      </div>
                      <div className="flex">
                        <button
                          className="remove-button uppercase tracking-wider mr-3"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                        <button
                          className="green-button uppercase tracking-wider"
                          type="submit"
                          data-test-id="verify-btn"
                          disabled={isSubmitting}
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  </div>
                </Form>
              );
            }}
          </Formik>
        )}
      </div>
    </AppModal>
  );
};

export default MFAModal;
