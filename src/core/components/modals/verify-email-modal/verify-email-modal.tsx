import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_LOGIN } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { EmailVerifyPayload } from "src/pages/auth/auth.model";
import {
  emailVerification,
  eulaVerify,
  userData,
  verifyEmailLink,
} from "src/pages/auth/auth.redux";
import AppModal from "../app-modal";
import "./verify-email.scss";

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  eula: boolean;
  ev: boolean;
}

// eslint-disable-next-line react/prop-types
const VerifyEmailModal: React.FC<VerifyEmailModalProps> = ({ isOpen, onClose, eula, ev }) => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const authData = localStorage.getItem("auth");
  const emailId = authData ? JSON.parse(authData)?.emailId : null;
  const isEmailVerified = useAppSelector((state) => state.auth.isEmailVerified);
  const [eulaState, setEula] = useState<boolean>(eula);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const sendEmailVerification = async () => {
    const token = urlSearchParams.get("t");
    const payloadData: EmailVerifyPayload = {
      token: token || "",
    };
    if (token) {
      await dispatch(verifyEmailLink(payloadData));
    } else {
      await dispatch(emailVerification());
    }
  };

  const redirectToLogin = () => {
    navigate(ROUTE_LOGIN);
    window.location.reload();
  };

  const eulaVerification = async () => {
    const result = await dispatch(eulaVerify());
    if (result?.isSuccess) {
      if (ev) {
        const resultUser = await dispatch(userData());
        resultUser?.isSuccess && window.location.reload();
      } else {
        setEula(false);
      }
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  useEffect(() => {
    return () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    };
  }, []);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      shouldCloseOnOverlayClick={true}
      overlayClassName={"modal-overlay-b"}
    >
      {eulaState ? (
        <div className="eula-outer-wrap">
          <div className="share-inner">
            <div className="w-full flex-column">
              <div className="eula-heading-bg mb-5">
                <div className="fs14 font-bold text-body uppercase mb-3">
                  End User License Agreement
                </div>
                <div className="fs12">
                  You must agree to our End User License Agreement to start using SimpleO
                </div>
              </div>
              <div className="content-body">
                <div className="eula-body-text">
                  <p>
                    By purchasing a License Key and/or downloading and using the{" "}
                    <strong>SimpleO App</strong>, You agree, without reservation to be bound by the
                    terms of this <strong>EULA</strong>. If You do not agree with the terms of this{" "}
                    <strong>EULA</strong>, please do not purchase a License Key and/or download and
                    use the <strong>SimpleO App</strong>.
                  </p>
                  <p>
                    If You accept the terms and conditions in this <strong>EULA</strong> on behalf
                    of a company or other legal entity, You warrant that You have full legal
                    authority to accept the terms and conditions in this <strong>EULA</strong> on
                    behalf of such company or other legal entity, and to legally bind such company
                    or other legal entity.
                  </p>
                  <p>
                    You may not accept this <strong>EULA</strong> if You are not of legal age to
                    form a binding contract with <strong>SimpleO Legal Entity</strong>.
                  </p>
                  <p>
                    End User License Agreement ("<strong>EULA</strong>") is a legal agreement
                    between you (<strong>"End User" or "You"</strong>) and{" "}
                    <strong>&lt;Legal US Entity Name&gt;</strong> ("Licensor" or "We") regarding the
                    use of SimpleO Contract Management Application (the "Software"). By installing,
                    using, or accessing the Software, you agree to be bound by the terms and
                    conditions of this <strong>EULA</strong>.
                  </p>
                  <div className="orderlist">
                    <ol>
                      <li>
                        <strong>LICENSE GRANT</strong>
                        <ol>
                          <li>
                            <strong>License:</strong> Licensor grants You a non-exclusive,
                            non-transferable, non-sublicensable, limited, revocable and limited
                            license to use the Software solely for the business use, subject to the
                            terms and conditions of this <strong>EULA</strong>.<br />
                            <strong>SimpleO</strong> is and remains the owner of any intellectual
                            property rights with respect to the SimpleO App. You shall not acquire
                            any ownership to the <strong>SimpleO App</strong> as result of Your
                            purchase of the License Key or Your Use of the{" "}
                            <strong>SimpleO App</strong>.
                          </li>
                          <li>
                            <strong>Restrictions:</strong> You shall Use the{" "}
                            <strong>SimpleO App</strong> on one computer only, unless You have
                            purchased a volume license. In the event You have purchased a volume
                            license, the number of computers You may Use the{" "}
                            <strong>SimpleO App</strong> on shall not exceed the number of SimpleO
                            App Licenses purchased. If You exceed the limit, or share the License
                            Key, <strong>SimpleO App</strong> may block the License Key.
                          </li>
                        </ol>
                      </li>
                      <li>
                        <strong>INTELLECTUAL PROPERTY RIGHTS</strong>
                        <ol>
                          <li>
                            <strong>Ownership:</strong> The Software is protected by intellectual
                            property laws and remains the property of Licensor. This{" "}
                            <strong>EULA</strong> does not convey any rights or ownership in the
                            Software, except for the limited license granted herein.
                          </li>
                        </ol>
                      </li>
                      <li>
                        <strong>SUPPORT AND UPDATES</strong>
                        <ol>
                          <li>
                            <strong>Support:</strong> Licensor may provide support and updates for
                            the Software at its discretion. Support and updates may be subject to
                            additional terms.
                          </li>
                        </ol>
                      </li>
                      <li>
                        <strong>TERM AND TERMINATION</strong>
                        <ol>
                          <li>
                            <strong>Term:</strong> This <strong>EULA</strong> is effective upon
                            installation and shall remain in force until terminated.
                          </li>
                          <li>
                            <strong>Termination:</strong> Licensor may terminate this{" "}
                            <strong>EULA</strong> if You breach any of its terms. Upon termination,
                            You must cease using the Software and destroy all copies in your
                            possession.
                          </li>
                        </ol>
                      </li>
                      <li>
                        <strong>DISCLAIMER OF WARRANTY</strong>
                        <ol>
                          <li>
                            <strong>As-Is:</strong> THE SOFTWARE IS PROVIDED "AS IS" WITHOUT
                            WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. LICENSOR DISCLAIMS
                            ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS
                            FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                          </li>
                        </ol>
                      </li>
                      <li>
                        <strong>LIMITATION OF LIABILITY</strong>
                        <ol>
                          <li>
                            <strong>No Liability:</strong> TO THE MAXIMUM EXTENT PERMITTED BY
                            APPLICABLE LAW, LICENSOR SHALL NOT BE LIABLE FOR ANY INDIRECT,
                            INCIDENTAL, CONSEQUENTIAL, OR SPECIAL DAMAGES ARISING OUT OF OR IN
                            CONNECTION WITH THE SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
                            DAMAGES.
                          </li>
                        </ol>
                      </li>
                      <li>
                        <strong>GOVERNING LAW</strong>
                        <ol>
                          <li>
                            <strong>Jurisdiction:</strong> This <strong>EULA</strong> is governed by
                            and construed in accordance with the laws of State of Delaware, US.
                          </li>
                        </ol>
                      </li>
                      <li>
                        <strong>ENTIRE AGREEMENT</strong>
                        <ol>
                          <li>
                            <strong>Entire Agreement:</strong> This EULA constitutes the entire
                            agreement between You and Licensor concerning the Software and
                            supersedes all prior or contemporaneous agreements, representations, and
                            understandings.
                          </li>
                        </ol>
                      </li>
                    </ol>
                    <div>
                      <p>
                        Please carefully read this EULA before using the Software. By installing,
                        using, or accessing the Software, You acknowledge that You have read and
                        understand the terms and conditions and agree to be bound by them.
                      </p>

                      <p>
                        If you have any questions or concerns regarding this <strong>EULA,</strong>{" "}
                        please contact us at <strong>hello@simpleo.ai</strong>.
                      </p>

                      <strong>&lt;SimpleO US legal Entity Name&gt;</strong>
                      <p>
                        4221 Lilac Ridge
                        <br />
                        Rd.San Ramon
                        <br />
                        <strong>CA 94582</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="eula-footer-bg">
                <div className="flex items-center">
                  <div className="w-content-left text-body">
                    <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} /> I
                    agree to this End User License agreement
                  </div>
                  <div className="grow">
                    <div className="flex justify-end">
                      <button
                        className={` uppercase tracking-wider ${isChecked ? "green-button" : "green-button  btn-disable "}`}
                        onClick={() => isChecked && eulaVerification()}
                        disabled={!isChecked}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 eula-sm-text">
                  Any clarification contact our support team at <strong>hello@simpleo.ai</strong>{" "}
                  {/* and <strong>&lt;phone number&gt;</strong> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="team-user-list-modal">
          <div className="team-user-body">
            {isEmailVerified ? (
              <div className="verification-outer-wrap">
                <div className="w-full flex-column">
                  <div className="p-5">
                    <div className="fs14 font-bold text-body mb-3">Email address verified</div>
                    <div className="email-body-text1 email-w-max">
                      <p>Thank you for verifying your email address.</p>
                      <p>
                        Accelerate Your Contract Review and Management with SimpleO’s AI-powered
                        system.
                      </p>
                    </div>
                  </div>
                  <div className="email-full-sec">
                    <div className="flex">
                      <button
                        className="green-button uppercase tracking-wider mr-4"
                        onClick={redirectToLogin}
                      >
                        Explore now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="verification-outer-wrap">
                <div className="w-full flex-column">
                  <div className="p-5">
                    <div className="fs14 font-bold text-body mb-3">
                      Please verify your email address to view document
                    </div>

                    {urlSearchParams.has("t") ? (
                      <div className="email-body-text1 email-w-max">
                        <p>
                          In order to continue on SimpleO, you need to verify your email address
                          ,Click the button below to verify.
                        </p>
                      </div>
                    ) : (
                      <div className="email-body-text1 email-w-max">
                        <p>
                          In order to continue on SimpleO, you need to verify your email address{" "}
                          <strong>{emailId}</strong> Click the button below and we will send you a
                          verification email
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="email-full-sec">
                    <div className="flex">
                      <button
                        className="green-button uppercase tracking-wider mr-4"
                        onClick={() => sendEmailVerification()}
                      >
                        {urlSearchParams.has("t") ? "verify email" : "send verification email"}
                      </button>
                    </div>
                  </div>

                  {urlSearchParams.has("t") ? (
                    ""
                  ) : (
                    <div className="p-5 fs12">
                      Did not get verification email?{" "}
                      <a
                        href="#"
                        className="link-underline"
                        onClick={() => sendEmailVerification()}
                      >
                        Click here to resend
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppModal>
  );
};

export default VerifyEmailModal;
