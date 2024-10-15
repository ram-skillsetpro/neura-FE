import "core/components/no-data/empty-state.scss";
import { useAppDispatch, useAppSelector } from "core/hook";
import { useAuthorityCheck } from "core/utils/use-authority-check.hook";
import { contractReducer } from "pages/contract/contract.redux";
import {
  dashboardStatsReducer,
  getCurrentMonthFileStats,
  getFileStats,
  getMonthlyFileStats,
} from "pages/dashboard-stats/dashboard-stats.redux";
import GRCDashboard from "pages/grc-dashboard/grc-dashboard";
import { ContractObligationsType } from "pages/grc-dashboard/grc-dashboard.model";
import { grcDashboardReducer } from "pages/grc-dashboard/grc-dashboard.redux";
import { manageMembersReducer } from "pages/manage-members/manage-members.redux";
import { clearTeamList, fetchTeamList, teamReducer } from "pages/manage-team/team.redux";
import {
  dashboardReducer,
  getFoldersPerPage,
  getRecentDashboardFilesList,
} from "pages/user-dashboard/dashboard.redux";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE_ADMIN, ROUTE_RECENT_CONTRACT, USER_AUTHORITY } from "src/const";
import { Loader } from "src/core/components/loader/loader.comp";
import { alertsReducer, getAlertsForMe } from "../alerts/alerts.redux";
import "../grc-dashboard/_compliance-dash.scss";
import "./dashboard-stats.scss";
import NotificationsTeamsFolder from "./notification-team-folder";
import RecentContractDashboard from "./recent-contract";
import UserContractType from "./users-contractType";

const DashboardStats: React.FC = () => {
  const isAdmin = useAuthorityCheck([USER_AUTHORITY.GRC]);
  const location = useLocation();
  const escalationState: ContractObligationsType = location.state || {};

  const dispatch = useAppDispatch();
  const fileStats = useAppSelector((state) => state.dashboardStats.fileStats);
  const isLoading = useAppSelector((state) => state.dashboardStats.isLoading);
  const [dashboardState, setDashboardState] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getMonthlyFileStats());
    dispatch(getFileStats());
    dispatch(getCurrentMonthFileStats());
    dispatch(getRecentDashboardFilesList({ pgn: 1 }));
    dispatch(fetchTeamList({ mergeResponse: false }));
    dispatch(getFoldersPerPage(1));
    dispatch(getAlertsForMe());
    if (escalationState.contractName) {
      setDashboardState(true);
    }

    return () => {
      dispatch(clearTeamList());
      // setDashboardState(true);
    };
  }, []);

  return (
    <>
      <div className="left-section">
        <div className="compliance-section-inner">
          <div className="mb-8 left-inner-sticky">
            <div className="flex items-center justify-between">
              <div>
                <h1>Dashboard</h1>
              </div>
              {isAdmin && (
                <div>
                  <div className="linktoggle-sec">
                    <ul>
                      <li onClick={() => setDashboardState(false)}>
                        <a href="#" className={!dashboardState ? "active" : ""}>
                          Contract
                        </a>
                      </li>
                      <li onClick={() => setDashboardState(true)}>
                        <a href="#" className={dashboardState ? "active" : ""}>
                          Compliance
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
          {dashboardState && isAdmin ? (
            <GRCDashboard />
          ) : (
            <>
              {isLoading && <Loader />}
              <section className="relative mb-3">
                <div className="ld-top-sec">
                  <div className="box-card">
                    <div className="card-info">
                      <div className="card-info-title font-bold">Uploaded Files</div>
                      <div className="card-info-numb">
                        {fileStats?.length > 0 ? fileStats[0].tfc : 0}
                      </div>
                      <div>
                        <button
                          className="view-all-btn"
                          onClick={() => navigate(`/${ROUTE_ADMIN}/${ROUTE_RECENT_CONTRACT}`)}
                        >
                          All Files
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="box-card">
                    <div className="card-info">
                      <div className="card-info-title font-bold">Pages Processed</div>
                      <div className="card-info-numb">
                        {fileStats?.length > 0 ? fileStats[0].nopg : 0}
                        <div className="fs10 mt-3">Pages</div>
                      </div>
                      <div>
                        <button
                          className="view-all-btn"
                          onClick={() => navigate(`/${ROUTE_ADMIN}/${ROUTE_RECENT_CONTRACT}`)}
                        >
                          View All
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="box-card">
                    {fileStats?.length > 0 && (
                      <div className="card-info">
                        <div className="card-info-title font-bold">
                          Files Processed{" "}
                          {fileStats[0].spc !== 0 &&
                          fileStats[0].tfc !== null &&
                          fileStats[0].spc !== null
                            ? Math.round(
                                (fileStats[0].spc /
                                  (fileStats[0].tfc - (fileStats[0]?.stronly || 0))) *
                                  100,
                              ) + " %"
                            : "N/A"}
                        </div>
                        <div className="card-info-numb">
                          <div className="show-complete">
                            <div
                              className="show-complete-done"
                              style={{
                                width:
                                  fileStats[0].spc !== 0 &&
                                  fileStats[0].tfc !== null &&
                                  fileStats[0].spc !== null
                                    ? Math.round(
                                        (fileStats[0].spc /
                                          (fileStats[0].tfc - (fileStats[0]?.stronly || 0))) *
                                          100,
                                      ) + "%"
                                    : "0%",
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <button
                            className="view-all-btn"
                            onClick={() => navigate(`/${ROUTE_ADMIN}/${ROUTE_RECENT_CONTRACT}`)}
                          >
                            View All
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="box-card">
                    <div className="card-info">
                      <div className="card-info-title font-bold">Data Processed</div>
                      <div className="card-info-numb">
                        {fileStats && fileStats?.length > 0
                          ? fileStats[0]?.flsz >= 1024
                            ? (fileStats[0]?.flsz / 1024).toFixed(2) + " GB"
                            : fileStats[0]?.flsz + " MB"
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <RecentContractDashboard />
              <NotificationsTeamsFolder />
              <UserContractType />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardStats;

export const reducer = {
  team: teamReducer,
  contract: contractReducer,
  manageMembers: manageMembersReducer,
  dashboardStats: dashboardStatsReducer,
  dashboard: dashboardReducer,
  alerts: alertsReducer,
  grcDashboard: grcDashboardReducer,
};
