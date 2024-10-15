import { useAppDispatch, useAppSelector } from "core/hook";
import useIdleTimer from "core/utils/use-idle-timer.hook";
import moment from "moment";
import { signLater } from "pages/pre-contract/signature-precontract/docusign.redux";
import { useEffect } from "react";
import { ROUTE_ADMIN, UPLOAD_AND_SIGN } from "src/const";

const SignLater = () => {
  const dispatch = useAppDispatch();
  const contractId = useAppSelector((state) => state.preContract.contractId);

  const { isTimerOver, timeLeft } = useIdleTimer();

  useEffect(() => {
    if (isTimerOver) {
      signContractLater();
    }
  }, [isTimerOver, timeLeft]);

  const signContractLater = () => {
    if (location?.pathname === `/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN}`) {
      dispatch(signLater(contractId, true));
    } else {
      dispatch(signLater(contractId));
    }
  };
  return (
    <>
      <button
        onClick={() => signContractLater()}
        className="button-green-btn rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer"
      >
        Sign Later
      </button>
      {
        <div className="wizard-pagination">
          {timeLeft <= 60 && (
            <div className="wizard-step1 uppercase font-bold fs10 sm-button tracking-wider rounded-12 sign-later-timer">
              {moment.utc(timeLeft * 1000).format("mm:ss")} Remaining
            </div>
          )}
        </div>
      }
    </>
  );
};

export default SignLater;
