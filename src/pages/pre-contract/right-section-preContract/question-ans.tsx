import React from "react";
import { useSearchParams } from "react-router-dom";
import { USER_AUTHORITY } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { getAuth, getUserIdWithRole } from "src/core/utils";
import AddFieldForm from "src/pages/template/right-section-template/add-quesans-template";
import { checkUserAuthrity } from "src/pages/user-dashboard/common-utility/utility-function";
import { setContractTypeError, setContractTypeId, setQASet } from "../pre-contract.redux";

interface UploadFilePreContractProps {}
const UploadFilePreContract: React.FC<UploadFilePreContractProps> = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");

  const dispatch = useAppDispatch();
  const {
    questionaireArray: markerJsonData,
    questionAnswerSet,
    contractTypeId,
    contractTypeError,
    questionAnswerError,
  } = useAppSelector((state) => state.preContract);
  const { contractTypes } = useAppSelector((state) => state.contract);

  const { profileId: profileID } = getAuth();
  const { shareUser, createdby, activeStagePreContract } = useAppSelector(
    (state) => state.preContract,
  );
  const canEdit = getUserIdWithRole(shareUser, USER_AUTHORITY.ROLE_PRE_CONTRACT_EDITOR, profileID);

  const handleAnswerChange = (e: any, question: any) => {
    const { variable_name: variableName } = question || {};
    dispatch(
      setQASet({
        value: e.target.value,
        key: variableName,
      }),
    );
  };

  const checkReadOnly = () => {
    if (!key) {
      return false;
    }
    return checkUserAuthrity(createdby, profileID, canEdit, activeStagePreContract);
  };

  const removeDuplicate = (dataList: Array<any> = []) => {
    const map = new Map();
    dataList.forEach((data) => {
      map.set(data.variable_name, data);
    });

    const newList = Array.from(map).map((data) => {
      return data[1];
    });

    return newList;
  };

  return (
    <>
      {!key || !checkUserAuthrity(createdby, profileID) ? (
        <div className="contract-name-wrap w-full mb-6">
          <select
            className="custom-select w-full p-2"
            value={contractTypeId}
            onChange={(e) => {
              dispatch(setContractTypeError(null));
              dispatch(setContractTypeId(Number(e.target.value)));
            }}
          >
            <option value={0}>Contract Type</option>
            {contractTypes.map((data, index) => (
              <option key={index} value={data.id}>
                {data.name}
              </option>
            ))}
          </select>
          {contractTypeId === 0 && (
            <div className="contract-input-error mt-3">{contractTypeError}</div>
          )}
        </div>
      ) : (
        ""
      )}
      <div
        className="wizard-elements"
        style={
          !checkUserAuthrity(createdby, profileID, canEdit, activeStagePreContract) ||
          createdby === 0
            ? {}
            : { pointerEvents: "none", opacity: 0.5 }
        }
      >
        {markerJsonData && markerJsonData.length > 0 && (
          <h5 className="h5 ml-3">Identified attributes in uploaded playbook</h5>
        )}
        <div className="mb-6">
          {markerJsonData &&
            removeDuplicate(markerJsonData || []).map(
              (
                question: {
                  question: string;
                  ans_type: string;
                  variable_name: string;
                  value: string;
                },
                index: number,
              ) => (
                <div className="identify-attr mb-2" key={index}>
                  <button className="identify-btn">
                    <span>{question.question}</span>
                  </button>

                  {question.ans_type === "String" ? (
                    <div className="identify-btn-data" style={{ flexDirection: "column" }}>
                      <input
                        type="text"
                        className={`identify-input placeholder-input-${question.variable_name}`}
                        placeholder=""
                        value={
                          questionAnswerSet[question.variable_name]?.value ||
                          (questionAnswerSet[question.variable_name]?.key ? "" : question.value) ||
                          ""
                        }
                        onChange={(e) => handleAnswerChange(e, question)}
                        disabled={checkReadOnly()}
                      />
                      {questionAnswerError[question.variable_name]?.error ? (
                        <div className="error-message">
                          {questionAnswerError[question.variable_name]?.error}
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    <div className="identify-btn-data"></div>
                  )}
                </div>
              ),
            )}
          {/* bottom  space */}
        </div>
      </div>
      {(createdby === profileID || !key) && <AddFieldForm />}
    </>
  );
};

export default UploadFilePreContract;
