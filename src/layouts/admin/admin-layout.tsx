import { alertsReducer } from "pages/alerts/alerts.redux";
import { contractReducer } from "pages/contract/contract.redux";
import { preContractReducer } from "pages/pre-contract/pre-contract.redux";
import { docusignReducer } from "pages/pre-contract/signature-precontract/docusign.redux";
import { Outlet, useLocation } from "react-router";
import {
  PRE_CONTRACT,
  PRE_TEMPLATE,
  ROUTE_CONTRACT_VIEW,
  ROUTE_OBLIGATION,
  UPLOAD_AND_SIGN,
} from "src/const";
import { useAppSelector } from "src/core/hook";
import { contractApprovalReducer } from "src/pages/pre-contract/right-section-preContract/approval-component/approval.redux";
import "./admin-layout.scss";
import AdminHeader from "./components/admin-header/admin-header";
import { headerSearchdReducer } from "./components/admin-header/header-auth.redux";
import { LeftSidebar } from "./components/left-sidebar/left-sidebar";

export default function AdminLayout() {
  const { expandEditor } = useAppSelector((state) => state.preContract);

  const location = useLocation();
  const { pathname } = location || {};

  return (
    <>
      <AdminHeader />
      <main className="content-sec" style={{padding: expandEditor ? "0" : ""}}>
        {[
          "/admin/" + ROUTE_CONTRACT_VIEW,
          "/admin/" + PRE_CONTRACT,
          "/admin/" + PRE_TEMPLATE,
          "/admin/" + UPLOAD_AND_SIGN,
          "/admin/" + ROUTE_OBLIGATION,
        ].includes(pathname) ? (
          ""
        ) : (
          <LeftSidebar />
        )}
        <Outlet />
      </main>
    </>
  );
}

export const reducer = {
  headerSearchContract: headerSearchdReducer,
  alerts: alertsReducer,
  preContract: preContractReducer,
  docusign: docusignReducer,
  contract: contractReducer,
  contractApprovals: contractApprovalReducer,
};
