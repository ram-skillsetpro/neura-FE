import {
  fetchApprovalsData,
  fetchUserStatusUploadAndSign,
  markWorkComplete,
} from "pages/pre-contract/right-section-preContract/approval-component/approval.redux";
import { requestSignDocUrl } from "pages/pre-contract/signature-precontract/docusign.redux";
import { CSSProperties, Fragment, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ROUTE_ADMIN, UPLOAD_AND_SIGN } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";

const Approvals = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const authData = JSON.parse(localStorage.getItem("auth") || "{}");
  const profileID = authData?.profileId ? authData.profileId : "";
  const ApprovalList = useAppSelector((state) => state.contractApprovals?.ApprovalList);
  const isSignLater = useAppSelector((state) => state.docusign?.isSignLater);
  const { contractId, preContractPdf } = useAppSelector((state) => state.preContract);
  const stage = useAppSelector((state) => state.preContract.activeStagePreContract);
  let isWorkInProgress: any;
  let isUserWIP: any;

  if (Array.isArray(ApprovalList)) {
    isWorkInProgress = ApprovalList.some((user) => user.isWorkDone === 2);
    isUserWIP = ApprovalList.some((user) => user.isWorkDone === 2 && user.userId === profileID);
  }

  const handleApproveClick = () => {
    dispatch(markWorkComplete(contractId));
  };

  const handleSinginComplete = async () => {
    if (location?.pathname === `/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN}`) {
      await dispatch(requestSignDocUrl(contractId, true));
      dispatch(fetchUserStatusUploadAndSign(contractId));
    } else {
      await dispatch(requestSignDocUrl(contractId));
      dispatch(fetchApprovalsData(contractId));
    }
  };

  useEffect(() => {
    if (location?.pathname === `/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN}`) {
      if (contractId > 0) {
        dispatch(fetchUserStatusUploadAndSign(contractId));
      }
    } else {
      dispatch(fetchApprovalsData(contractId));
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 5 && !isSignLater && isUserWIP && location.pathname === `/admin/pre-contract`) {
      dispatch(requestSignDocUrl(contractId));
    }

    if (
      stage === 5 &&
      !isSignLater &&
      isUserWIP &&
      location?.pathname === `/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN}`
    ) {
      dispatch(requestSignDocUrl(contractId, true));
    }
  }, [stage, isUserWIP]);

  return (
    <div>
      {ApprovalList?.length > 0 ? (
        <div>
          {ApprovalList.some(
            (approval) =>
              profileID === approval.userId &&
              approval.isWorkDone === 0 &&
              stage === 5 &&
              !isWorkInProgress,
          ) && (
            <div className="mb-6">
              <div className="fs12 font-bold lh3 mb-6">Sign this document using DocuSign</div>
              <div className="mb-6 button-tool-tip">
                {preContractPdf === null && (
                  <div className="button-info">
                    Contract is not ready for signing, please try after sometime.
                  </div>
                )}
                <button
                  className="button-green xl-button fs18 font-bold rounded-12 tracking-wider font-bold uppercase cursor-pointer w-full"
                  onClick={() => handleSinginComplete()}
                  disabled={preContractPdf === null}
                  aria-disabled={preContractPdf === null}
                >
                  Sign Now
                </button>
              </div>
              <div className="font-bold fs12 text-light-color lh3">
                For any clarification contact our support team at{" "}
                <a href="mailto:support@simpleo.ai" className="text-light-color">
                  support@simpleo.ai
                </a>{" "}
              </div>
            </div>
          )}
          {ApprovalList.some(
            (approval) =>
              profileID === approval.userId &&
              approval.isWorkDone === 0 &&
              stage === 5 &&
              isWorkInProgress,
          ) && (
            <div className="mb-6">
              <div className="fs12 font-bold lh3 mb-6">Sign this document using DocuSign</div>
              <div className="mb-6">
                <button
                  className="button-green xl-button fs18 font-bold rounded-12 tracking-wider font-bold uppercase cursor-pointer w-full"
                  disabled
                >
                  Sign Now
                </button>
              </div>
              <div className="font-bold fs12 text-light-color lh3">
                For any clarification contact our support team at{" "}
                <a href="mailto:support@simpleo.ai" className="text-light-color">
                  support@simpleo.ai
                </a>{" "}
              </div>
            </div>
          )}
          {ApprovalList.map((approval, index) => {
            const isCurrentUser = profileID === approval.userId;

            return (
              <Fragment key={index}>
                <div
                  key={approval.id}
                  style={
                    stage === 5 && isCurrentUser && approval.isWorkDone === 0
                      ? ({ display: "none" } as CSSProperties)
                      : {}
                  }
                  className="bg-light1 p-3 rounded-6 mb-4 text-defaul-color"
                >
                  {stage === 2 && (
                    <div className="fs11 font-bold flex items-center lh3">
                      <span
                        className={`${
                          approval.isWorkDone ? "dot-g" : "dot-orange"
                        } mr-2-5 inline-block`}
                      ></span>
                      {isCurrentUser
                        ? approval.isWorkDone === 1
                          ? `You have completed your work.`
                          : "Mark your work complete."
                        : approval.isWorkDone === 1
                          ? `${approval.userName} has completed the work`
                          : `${approval.userName} work is not complete.`}
                    </div>
                  )}
                  {(stage === 3 || stage === 4) && (
                    <div className="fs11 font-bold flex items-center lh3">
                      <span
                        className={`${
                          approval.isWorkDone ? "dot-g" : "dot-orange"
                        } mr-2-5 inline-block`}
                      ></span>
                      {isCurrentUser
                        ? approval.isWorkDone === 1
                          ? `You have approved this contract`
                          : "Your approval required"
                        : approval.isWorkDone === 1
                          ? `${approval.userName} has approved this contract`
                          : `${approval.userName} approval is pending`}
                    </div>
                  )}
                  {stage === 5 && (
                    <div className="fs11 font-bold flex items-center lh3">
                      <span
                        className={`${
                          approval.isWorkDone ? "dot-g" : "dot-orange"
                        } mr-2-5 inline-block`}
                      ></span>
                      {isCurrentUser
                        ? approval.isWorkDone === 1
                          ? `You have signed this contract`
                          : "Your signature is required for this contract."
                        : approval.isWorkDone === 1
                          ? `${approval.userName} has signed this contract`
                          : approval.isWorkDone !== 2 &&
                            `${approval.userName} signature is pending`}
                      {!isCurrentUser &&
                        approval.isWorkDone === 2 &&
                        `${approval.userName} is signing the contract`}
                    </div>
                  )}
                  <div className="mt-3">
                    {isCurrentUser && approval.isWorkDone === 0 && stage !== 5 && (
                      <button
                        className="button-orange rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer"
                        onClick={() => handleApproveClick()}
                      >
                        {stage === 2
                          ? "WORK COMPLETE"
                          : stage === 3 || stage === 4
                            ? "APPROVE"
                            : ""}
                      </button>
                    )}

                    {!isCurrentUser && approval.isWorkDone === 0 && (
                      <button className="button-orange rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer">
                        {stage === 5 ? "Signing is Pending" : "Pending"}
                      </button>
                    )}
                    {!isCurrentUser && approval.isWorkDone === 2 && stage === 5 && (
                      <button className="button-green-btn rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer">
                        {"Signing in Progress"}
                      </button>
                    )}
                    {!isCurrentUser && approval.isWorkDone === 1 && (
                      <button className="button-green-btn rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer">
                        {stage === 2
                          ? "COMPLETED"
                          : stage === 3 || stage === 4
                            ? "Approved"
                            : stage === 5
                              ? "Signing Complete"
                              : ""}
                      </button>
                    )}
                    {isCurrentUser && approval.isWorkDone === 1 && (
                      <button className="button-green-btn rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer">
                        {stage === 2
                          ? "COMPLETED"
                          : stage === 3 || stage === 4
                            ? "Approved"
                            : stage === 5
                              ? "Signing Complete"
                              : ""}
                      </button>
                    )}
                  </div>
                  {/* </a> */}
                </div>
              </Fragment>
            );
          })}
        </div>
      ) : (
        <div className="bg-light1 p-3 rounded-6 mb-4 text-defaul-color">
          <div className="fs11 font-bold flex items-center lh3">
            <span className={"dot-red  mr-2-5 inline-block"}></span>
            {stage === 2
              ? "No user added as Editor"
              : stage === 3
                ? "No user added as Reviewer"
                : stage === 4
                  ? "No user added as Approver"
                  : stage === 5
                    ? "No user added as Signatory"
                    : "Not Share With Any User"}
          </div>
          {/* </a> */}
        </div>
      )}
    </div>
  );
};

export default Approvals;
