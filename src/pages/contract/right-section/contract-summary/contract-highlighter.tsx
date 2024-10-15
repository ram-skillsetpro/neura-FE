import React, { useEffect, useState } from "react";
import { USER_AUTHORITY } from "src/const";
import { useAppDispatch } from "src/core/hook";
import { getClausePages } from "src/core/utils";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import { setCurrentHighlightedPage } from "../../contract.redux";

interface IContractHighlighter {
  clauseName: string;
  extractedCoordinates: Array<any>;
  openSection: boolean;
  handleClick: () => void;
  setIsEditButtonClicked: () => void;
}

const ContractHighlighter: React.FC<IContractHighlighter> = ({
  clauseName,
  extractedCoordinates = [],
  openSection = false,
  handleClick,
  setIsEditButtonClicked,
}) => {
  const dispatch = useAppDispatch();
  const [dataList, setDataList] = useState<Array<any>>([]);
  const [open, setOpen] = useState<boolean>(false);
  const isEditPermission = useAuthorityCheck([USER_AUTHORITY.SUMM_EDT]);
  const isRevLinkPermission = useAuthorityCheck([USER_AUTHORITY.REV_LNK]);


  useEffect(() => {
    if (extractedCoordinates.length) {
      setDataList(getClausePages(clauseName, extractedCoordinates));
    }
  }, [extractedCoordinates]);

  return (
    <>
      <h4
        className="flex relative"
        onClick={() => {
          handleClick();
          setOpen(false);
        }}
      >
        {clauseName}
        <span className="grow"></span>
        {isEditPermission && <div className="button-tool-tip relative">
          <i
            className="edit-ic playbook-ic cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditButtonClicked();
            }}
          ></i>
          <div className="button-info">Edit Clause</div>
        </div>}

        {dataList.length && openSection && isRevLinkPermission ? (
          <>
            <div
              className="button-tool-tip ml-3"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
            >
              <i className="view-icon sm"></i>
              <div className="button-info">View in Contract</div>
            </div>
          </>
        ) : (
          ""
        )}
      </h4>
      {dataList.length && openSection && isRevLinkPermission ? (
        <div className="page-data-sec" style={{ display: `${open ? "block" : "none"}` }}>
          {dataList.map((data, index) => (
            <div key={index} className="page-row fs12 flex items-center mb-2">
              Page {data.page}
              <span className="grow"></span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(setCurrentHighlightedPage(data));
                }}
                className="button-dark-gray rounded-12 sm-button font-bold"
              >
                <i className="view-icon ic-w"></i>
                View in Contract
              </button>
            </div>
          ))}
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default ContractHighlighter;
