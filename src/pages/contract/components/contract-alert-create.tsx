// import { useAppSelector } from "src/core/hook";
import AlertsListingInContract from "pages/contract/components/alert-listing";
import React, { useState } from "react";
import { USER_AUTHORITY } from "src/const";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import AlertsCreate from "src/pages/alerts/create/alerts-create";
interface ContractAlertCreateProps {
  fileId: number;
}
const ContractAlertCreate: React.FC<ContractAlertCreateProps> = ({ fileId }) => {
  const [isCreateAlertShow, setIsCreateAlertShow] = useState(false);
  const isAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN, USER_AUTHORITY.ALERT]);

  return (
    <div className="wrapper">
      {isAdmin && (
        <input type="button" onClick={() => setIsCreateAlertShow(true)} value={"Alert Create"} />
      )}
      {isCreateAlertShow && isAdmin && <AlertsCreate fileId={fileId} />}
      <AlertsListingInContract fileId={fileId} />
    </div>
  );
};

export default ContractAlertCreate;
