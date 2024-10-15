import { useAppDispatch, useAppSelector } from "core/hook";
import { getComplianceTypeChartData, getRiskStatusChartData } from "core/utils";
import { ChartCard } from "pages/grc-dashboard/chart-card";
import BarChart from "pages/grc-dashboard/charts/chart-table";
import EscalatedContractsComponent from "pages/grc-dashboard/escallated-contracts-compliance";
import { GRCDashboadCalendar } from "pages/grc-dashboard/grc-calendar";
import {
  getComplianceType,
  getDepartmentTeams,
  getRiskAudits,
  getRiskDeadlines,
  getRiskImpact,
} from "pages/grc-dashboard/grc-dashboard.redux";
import { useEffect } from "react";
import { Loader } from "src/core/components/loader/loader.comp";

const GRCDashboard = () => {
  const dispatch = useAppDispatch();

  const riskStatus = useAppSelector((state) => state.grcDashboard.riskStatus);
  const riskType = useAppSelector((state) => state.grcDashboard.riskType);
  const departmentTeams = useAppSelector((state) => state.grcDashboard.departmentTeams);
  const isLoading = useAppSelector((state) => state.grcDashboard.isLoading);

  const complianceTypeData = getComplianceTypeChartData(riskType);
  const riskImpactData = getRiskStatusChartData(riskStatus);

  useEffect(() => {
    dispatch(getDepartmentTeams());
    dispatch(getComplianceType());
    dispatch(getRiskImpact());
    dispatch(getRiskDeadlines());
    dispatch(getRiskAudits());
  }, []);

  return (
    <>
      {isLoading && <Loader />}
      <div className="relative">
        {/* <div className="card-bg mb-8">
              <div className="user-profile-sec items-center">
                <div className="user-img mr-3">
                  <img src={UserCircle} alt="User Circle" />
                </div>
                <div className="text-light-color relative">
                  Upload your profile picture
                  <div className="file-upload-link">
                    <input type="file" />
                  </div>
                </div>
                <span className="grow"></span>
                <div>
                  <button className="close-btn"></button>
                </div>
              </div>
            </div> */}
        {/* <AuditRiskComponent /> */}
        <EscalatedContractsComponent />
        <section className="card-bg department-sec mb-8 relative">
          <div className="mb-6 flex">
            <div className="card-heading">
              <h2>Department / Function</h2>
            </div>
            <span className="grow"></span>
            {/* <FrequencyDropdown /> */}
          </div>

          {departmentTeams.length > 0 ? (
            <BarChart data={departmentTeams} />
          ) : departmentTeams.length === 0 ? (
            isLoading ? (
              <div className="flex justify-center items-center" style={{ height: "300px" }}>
                <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3">
                  Loading
                </h4>
              </div>
            ) : (
              <div className="flex justify-center items-center" style={{ height: "300px" }}>
                <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3">
                  No Data
                </h4>
              </div>
            )
          ) : null}
        </section>
        <section className="mb-8">
          <div className="compliance-sec-row">
            {/* Compliance Type */}
            <ChartCard title="Compliance Type" data={complianceTypeData} />
            {/* Risk Impact */}
            <ChartCard title="Risk Impact" data={riskImpactData} />
          </div>
        </section>
        <section className="mb-8 card-bg calender-sec">
          <div className="chart-sec">
            <GRCDashboadCalendar />
          </div>
        </section>
      </div>
    </>
  );
};

export default GRCDashboard;
