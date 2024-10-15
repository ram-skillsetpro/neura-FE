// import SealQuestion from "assets/images_compliance/SealQuestion.svg";
// import sorting from "assets/images_compliance/sorting-ic.png";
import { useAppDispatch, useAppSelector } from "core/hook";
import { convertDateStringToDate, formatDate, stringToColor } from "core/utils";
import { formatDateWithOrdinal } from "core/utils/constant";
import { EscalationInfoType } from "pages/grc-dashboard/grc-dashboard.model";
import { getEscalations } from "pages/grc-dashboard/grc-dashboard.redux";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_ADMIN, ROUTE_OBLIGATION } from "src/const";

const EscalatedContractsComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const escalationFilters = useAppSelector((state) => state.grcDashboard.escalationFilters);
  const escalations = useAppSelector((state) => state.grcDashboard.escalations);
  const isLoading = useAppSelector((state) => state.grcDashboard.isLoading);
  const navigate = useNavigate();
  const [selectedSecondParty, setSelectedSecondParty] = useState("");
  const [selectedRiskCategory, setSelectedRiskCategory] = useState("");
  const [selectedObligationType, setSelectedObligationType] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [expandedEscalations, setExpandedEscalations] = useState<Set<number>>(new Set());
  const [paginationData, setPaginationData] = useState({
    totalItems: escalations?.totct,
    currentPage: escalations?.pgn || 1,
    itemsPerPage: escalations?.perpg,
  });
  const [inputPage, setInputPage] = useState<number | "">(1);

  useEffect(() => {
    const paginationData = {
      totalItems: escalations?.totct,
      currentPage: escalations?.pgn || 1,
      itemsPerPage: escalations?.perpg,
    }
    setPaginationData(paginationData);
  }, [escalations])


  const { itemsPerPage, totalItems } = paginationData;

  const totalPages = useMemo(
    () => Math.ceil(totalItems / itemsPerPage),
    [totalItems, itemsPerPage],
  );

  const handleSecondParty = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSecondParty(event.target.value);
  };

  const handleRiskCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRiskCategory(event.target.value);
  };

  const handleObligationType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedObligationType(event.target.value);
  };

  const handleDepartment = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(event.target.value);
  };

  const handleClickEscalation = (escalation: EscalationInfoType) => {
    const data: any = {}
    navigate(`/${ROUTE_ADMIN}/${ROUTE_OBLIGATION}`, { state: { escalation, data } });
  };

  // const toggleExpand = (index: number) => {
  //   setExpandedEscalations((prev) => {
  //     const newExpanded = new Set(prev);
  //     if (newExpanded.has(index)) {
  //       newExpanded.delete(index);
  //     } else {
  //       newExpanded.add(index);
  //     }
  //     return newExpanded;
  //   });
  // };

  const toggleExpand = (index: number) => {
    //@ts-ignore
    setExpandedEscalations((prev) => {
      const newExpanded = new Set();
      if (!prev.has(index)) {
        newExpanded.add(index);
      }
      return newExpanded;
    });
  };

  useEffect(() => {
    dispatch(getEscalations({ pgn: 1 }));
  }, []);

  const handleObligationClick = (escalation: EscalationInfoType, obligation: any) => {
    // escalation.isObligationClicked = true;
    // const updatedObligations = escalation?.obligations?.map(obligation1 =>
    //   obligation1.riskId === obligation?.riskId ? obligation : obligation1
    // );
    // return { ...escalation, obligations: updatedObligations };
    navigate(`/${ROUTE_ADMIN}/${ROUTE_OBLIGATION}`, { state: { escalation, obligation } });
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      setInputPage(newPage);
      dispatch(getEscalations({ pgn: newPage }));
    }
  };

  const handleLoadMore = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      handlePageChange(newPage);
    }
  };

  const handlePageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    const pageNumber = value ? parseInt(value, 10) : "";

    if (typeof pageNumber === "number" && pageNumber >= 1 && pageNumber <= totalPages) {
      setInputPage(pageNumber);
    } else {
      setInputPage("");
    }
  };

  const handlePageInputBlur = () => {
    if (inputPage === "") {
      setInputPage(paginationData?.currentPage);
    } else if (typeof inputPage === "number" && inputPage >= 1 && inputPage <= totalPages) {
      handlePageChange(inputPage);
    } else {
      setInputPage(paginationData?.currentPage);
    }
  };

  const handlePageInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const pageNumber = parseInt(inputPage as string, 10);
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        handlePageChange(pageNumber);
      }
    }
  };

  return (
    <section className="card-bg compliance-escalated mb-8 relative">
      <div className="escalated-t">
        <div className="card-heading">
          <h2 className="text-default-color">Contract Obligations</h2>
        </div>
        <span className="grow"></span>
        {/* <div className="card-ic-w">
          <img src={SealQuestion} alt="Seal Question" />
        </div> */}
      </div>
      <div className="escalated-b-sec">
        {/* <div className="font-semibold text-lighter-color mb-6">0 Contracts Selected</div> */}
        <div className="w-full mb-6">
          <div className="escalated-filter-sec">
            {/* <div className="col-w">
              <input type="date" className="inpt-style fs14" />
            </div> */}
            <div className="col-w">
              <select className="compliance-select w-full p-2" onChange={handleSecondParty}>
                <option value="">Second Party</option>
                {escalationFilters?.secondParty?.map((secondParty) => (
                  <option value={secondParty} key={secondParty}>
                    {secondParty}
                  </option>
                ))}
              </select>
            </div>
            {/* <div className="col-w">
              <select className="compliance-select w-full p-2" onChange={handleDepartment}>
                <option value="">Department</option>
                {escalationFilters?.department?.map((name) => (
                  <option value={name} key={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div> */}
            <div className="col-w">
              <select className="compliance-select w-full p-2" onChange={handleObligationType}>
                <option value="">Obligation Type</option>
                {escalationFilters?.obligationType?.map((name) => (
                  <option value={name} key={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-w">
              <select className="compliance-select w-full p-2" onChange={handleRiskCategory}>
                <option value="">Risk Category</option>
                {escalationFilters?.riskCategory?.map((risk) => (
                  <option value={risk} key={risk}>
                    {risk}
                  </option>
                ))}
              </select>
            </div>
            {/* <div className="col-w">
              <select className="compliance-select w-full p-2">
                {escalationFilters.contractType.map((type, index) => (
                  <option value={type} key={index}>
                    {type}
                  </option>
                ))}
                <option value="">Contract Type</option>
              </select>
            </div> */}
            {/* <div>
              <button className="icon-btn mr-3" disabled>
                <i className="upload-ic"></i>
              </button>
              <button className="icon-btn mr-3" disabled>
                <i className="print-ic"></i>
              </button>
            </div> */}
          </div>
        </div>
        {/* <div className="comp-filter-sec mb-6">
          <div className="comp-chips-box">
            SAMUEL
            <button className="close-chips"></button>
          </div>
          <div className="comp-chips-box">
            Finance
            <button className="close-chips"></button>
          </div>
          <div className="comp-chips-box">
            SAMUEL
            <button className="close-chips"></button>
          </div>
          <div className="comp-chips-box">
            Finance
            <button className="close-chips"></button>
          </div>
        </div> */}
        <div className="table-shorting">
          <table cellSpacing="0" id="">
            <thead>
              <tr className="first-row">
                {/* <th>
                  <div>
                    <input type="checkbox" />
                  </div>
                </th> */}
                <th>
                  <div className="flex items-center fs14">
                    <div className="uppercase">Contract Name</div>
                    <div className="table-sorting-btn">
                      {/* <img src={sorting} alt="Sorting Icon" /> */}
                    </div>
                  </div>
                </th>
                <th>
                  <div className="flex items-center fs14">
                    <div className="uppercase whitespace-nowrap">Second Party</div>
                    {/* <div className="table-sorting-btn">
                      <img src={sorting} alt="Sorting Icon" />
                    </div> */}
                  </div>
                </th>
                {/* <th>
                  <div className="flex items-center">
                    <div className="uppercase">Spoc</div>
                    <div className="table-sorting-btn">
                    </div>
                  </div>
                </th> */}
                {/* <th>
                  <div className="flex items-center fs14">
                    <div className="uppercase">Department</div>
                  </div>
                </th> */}
                <th>
                  <div className="flex items-center fs14">
                    <div className="uppercase">Obligation</div>
                    {/* <div className="table-sorting-btn">
                      <img src={sorting} alt="Sorting Icon" />
                    </div> */}
                  </div>
                </th>
                {/* <th>
                  <div className="flex items-center">
                    <div className="uppercase">Likelihood</div>
                    <div className="table-sorting-btn"> */}
                {/* <img src={sorting} alt="Sorting Icon" /> */}
                {/* </div>
                  </div>
                </th> */}
                <th>
                  <div className="flex items-center fs14">
                    <div className="uppercase">Risk Category</div>
                    {/* <div className="table-sorting-btn">
                      <img src={sorting} alt="Sorting Icon" />
                    </div> */}
                  </div>
                </th>
                <th>
                  <div className="flex items-center fs14">
                    <div className="uppercase whitespace-nowrap ">Required Attention</div>
                  </div>
                </th>
                <th>
                  <div className="flex items-center fs14">
                    <div className="uppercase whitespace-nowrap ">Last Modified</div>
                    {/* <div className="table-sorting-btn">
                      <img src={sorting} alt="Sorting Icon" />
                    </div> */}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {escalations?.result?.filter((escalation) => {
                return (
                  (!selectedSecondParty || escalation.secondParty === selectedSecondParty) &&
                  (!selectedRiskCategory ||
                    Object.keys(escalation.riskCategories).includes(selectedRiskCategory)) &&
                  (!selectedObligationType ||
                    Object.keys(escalation.obligationTypes).includes(selectedObligationType)) &&
                  (!selectedDepartment || escalation.department === selectedDepartment)
                );
              })
                .map((escalation, index) => (
                  <>
                    <tr key={index} >
                      {/* <tr key={index} onClick={() => navigate(`/${ROUTE_ADMIN}/${ROUTE_OBLIGATION}`)}> */}
                      {/* <td>
                      <div>
                        <input type="checkbox" />
                      </div>
                    </td> */}
                      <td>
                        <div className="ob-name">
                          <button
                            className={`sub-obligation-btn mr-3 ${expandedEscalations.has(index) ? "expand-info" : ""
                              }`}
                            onClick={() => toggleExpand(index)}
                          >
                            <i
                              className={`ic-inner ${expandedEscalations.has(index) ? "expand-info" : "hide-info"
                                }`}
                            ></i>
                          </button>

                          <div className="name-text-tool relative">
                            <div
                              className="flex items-center file-title-table inline-block overflow-hidden truncate-line1 lh1 rounded-6"
                              data-fulltext={escalation.contractName}
                              onClick={() => handleClickEscalation(escalation)}
                            >
                              {escalation.contractName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{escalation.secondParty ?? "N/A"}</td>
                      <td>
                        {Object.entries(escalation?.obligationTypes || {}).map(
                          ([obligation, count]) => (
                            <div
                              key={obligation}
                              className="alert-btn-size1 mr-2 mb-2"
                              style={{
                                backgroundColor: stringToColor(obligation),
                                color: "#000",
                              }}
                            >
                              {obligation} ({count})
                            </div>
                          ),
                        )}
                      </td>
                      <td>
                        {Object.entries(escalation?.riskCategories || {}).map(
                          ([category, count]) => (
                            <div
                              key={category}
                              className={`alert-btn-size1 ${category === "High" ? "high-bg" : category === "Moderate" ? "moderate-bg" : category === "Low" ? "low-bg" : category === "Medium" ? "medium-bg" : ""} mr-2 mb-2`}
                            >
                              {category} ({count})
                            </div>
                          ),
                        )}
                      </td>
                      <td>
                        {Object.entries(escalation?.requireAttention || {}).length === 0 ? (
                          <div>N/A</div>
                        ) : (
                          Object.entries(escalation?.requireAttention || {}).map(
                            ([requiredattention, count]) => (
                              <div key={requiredattention}>
                                {requiredattention} ({count})
                              </div>
                            )
                          )
                        )}
                      </td>
                      <td>
                        <div className="whitespace-nowrap">
                          {escalation.contractDate
                            ? formatDateWithOrdinal(
                              convertDateStringToDate(escalation.contractDate),
                            )
                            : "N/A"}
                        </div>
                      </td>
                    </tr>
                    {expandedEscalations.has(index) && escalation?.obligations && <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: "0 24px",
                          color: "#000",
                          background: "#fff",
                        }}
                      >
                        <table className="nested-tb-bg">
                          <thead>
                            <tr>
                              <th>
                                <div className="whitespace-nowrap">Obligation Name</div>
                              </th>
                              <th>Assigned Team</th>
                              <th>POC</th>
                              <th>Deadline</th>
                              <th>Status</th>
                              <th>Risk Category</th>
                            </tr>
                          </thead>
                          <tbody>
                            {escalation?.obligations?.map((obligation) => {
                              return (<tr>
                                <td>
                                  <div className="whitespace-nowrap" onClick={() => { handleObligationClick(escalation, obligation) }}>{obligation?.name}</div>
                                </td>
                                <td>{obligation?.team}</td>
                                <td>{obligation?.spoc}</td>
                                <td>{parseInt(obligation?.deadlineDate) === 0 ? "N/A" : formatDate(parseInt(obligation?.deadlineDate))}</td>
                                <td>{obligation?.status}</td>
                                <td>{obligation?.category}</td>
                              </tr>)
                            })}

                          </tbody>
                        </table>
                      </td>
                    </tr>}
                  </>
                ))}

              {escalations?.result?.filter((escalation) => {
                return (
                  (!selectedSecondParty || escalation.secondParty === selectedSecondParty) &&
                  (!selectedRiskCategory ||
                    Object.keys(escalation.riskCategories).includes(selectedRiskCategory)) &&
                  (!selectedObligationType ||
                    Object.keys(escalation.obligationTypes).includes(selectedObligationType))
                );
              }).length === 0 && isLoading ? (
                <tr>
                  <td colSpan={8}>
                    <h4 className="mt-3 fs12 font-bold text-center uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3">
                      Loading
                    </h4>
                  </td>
                </tr>
              ) : (
                escalations?.result?.length === 0 &&
                !isLoading && (
                  <tr>
                    <td colSpan={8}>
                      <h4 className="mt-3 fs12 font-bold text-center uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3">
                        No Data
                      </h4>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        {paginationData && (
          <div>
            <div id="myTable_info" role="status" aria-live="polite">
              {/* {paginationData && totalItems === 0
              ? "No entries"
              : paginationData
              ? `Showing ${Math.min(
                  (currentPage - 1) * paginationData.itemsPerPage + 1,
                  totalItems,
                )} to 
          ${Math.min(
            currentPage * paginationData.itemsPerPage,
            totalItems,
          )} of ${totalItems} entries`
              : ""} */}
            </div>

            <div className="dataTables_paginate paging_simple_numbers" id="myTable_paginate">
              {isLoading ? (
                <div className="flex justify-end">
                  <div className="simpleO-loader"></div>
                </div>
              ) : (
                <div className={`flex ${paginationData?.currentPage > 1 ? "justify-between" : "justify-end"}`}>
                  {paginationData?.currentPage > 1 && (
                    <div
                      className="dataTables_info"
                      id="myTable_info"
                      role="status"
                      aria-live="polite"
                    >
                      <div className="mt-3 mb-2 flex justify-center">
                        <button
                          className={`load-more-btn paginate_button next ${paginationData?.currentPage === 1 ? "disabled" : ""
                            }`}
                          onClick={() => handleLoadMore(paginationData?.currentPage - 1)}
                        >
                          Load Previous
                        </button>
                      </div>
                    </div>
                  )}
                  {paginationData && (
                    <div className="flex items-center justify-end">
                      <div className="text-light-color fs12 font-bold mr-3">
                        Go To{" "}
                        <input
                          type="text"
                          value={inputPage}
                          onChange={handlePageInputChange}
                          onBlur={handlePageInputBlur}
                          onKeyDown={handlePageInputKeyDown}
                          min={1}
                          max={totalPages}
                          className="pagination-input"
                        />
                      </div>
                    </div>
                  )}
                  {paginationData?.currentPage === totalPages ? null : totalPages > 0 ? (
                    <div
                      className="dataTables_info flex"
                      id="myTable_info"
                      role="status"
                      aria-live="polite"
                    >
                      <div className="mt-3 mb-2 flex items-center justify-end">
                        <div className="text-light-color fs12 font-bold mr-3">
                          Page {paginationData?.currentPage} of {totalPages}
                        </div>
                      </div>
                      <div className="mt-3 mb-2 flex justify-center">
                        <button
                          className={`load-more-btn paginate_button next ${paginationData?.currentPage === totalPages ? "disabled" : ""
                            }`}
                          onClick={() => handleLoadMore(paginationData?.currentPage + 1)}
                        >
                          Load Next
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default EscalatedContractsComponent;
