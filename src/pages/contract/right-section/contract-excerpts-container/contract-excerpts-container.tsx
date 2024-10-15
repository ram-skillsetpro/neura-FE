import React, { useEffect, useState } from "react";
import { USER_AUTHORITY } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import { setActiveContractTab } from "src/layouts/admin/components/admin-header/header-auth.redux";
import "./contract-excerpts-container.scss";
import ContractSnippets from "./contract-snippet/contract-snippets";
import RedactPDF from "./redact-pdf/redact-pdf";

interface IContractExcerptsContainer {
  fileId: number;
  folderId?: number;
  teamId: number;
  fileName: string;
}

const ContractExcerptsContainer: React.FC<IContractExcerptsContainer> = ({
  fileId,
  folderId,
  teamId,
  fileName,
}) => {
  const dispatch = useAppDispatch();
  const tabName = useAppSelector((state) => state.headerSearchContract.activeContractTab);

  const [activeTab, setActiveTab] = useState<string>(tabName);

  const snippetPermission = useAuthorityCheck([USER_AUTHORITY.SNPT_SHR]);
  const redactPermission = useAuthorityCheck([USER_AUTHORITY.RDT_SHR]);

  useEffect(() => {
    dispatch(setActiveContractTab(activeTab));
  }, [activeTab]);

  useEffect(() => {
    if (!snippetPermission && redactPermission) {
      dispatch(setActiveContractTab("redact"));
    }
  }, [snippetPermission, redactPermission]);

  return (
    <div className="right-tab-content tab-playbook">
      <ul className="app-tab-style">
        {snippetPermission && (
          <li
            className={`${activeTab === "snippets" ? "active" : ""}`}
            onClick={() => setActiveTab("snippets")}
          >
            <a href="#tab1">Excerpts</a>
          </li>
        )}
        {redactPermission && (
          <li
            className={`${activeTab === "redact" ? "active" : ""}`}
            onClick={() => setActiveTab("redact")}
          >
            <a href="#tab1">Redacted PDF</a>
          </li>
        )}
      </ul>

      {activeTab === "snippets" && snippetPermission ? (
        <ContractSnippets fileId={fileId} folderId={folderId} teamId={teamId} />
      ) : (
        ""
      )}

      {activeTab === "redact" && redactPermission ? (
        <RedactPDF fileId={fileId} folderId={folderId} teamId={teamId} fileName={fileName} />
      ) : (
        ""
      )}
    </div>
  );
};

export default ContractExcerptsContainer;
