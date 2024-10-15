import { useAppDispatch, useAppSelector } from "core/hook";
import {
  clearReportList,
  dashboardContractReducer,
  getExtractedContractReport,
  initiateDownloadRequest,
} from "pages/contract-data-list/contract-data-list.redux";
import React, { useEffect, useMemo, useState } from "react";
import { FILTER_TYPE, ROUTE_ADMIN, ROUTE_CONTRACT_LIST, ROUTE_CONTRACT_VIEW } from "src/const";
import { Loader } from "src/core/components/loader/loader.comp";
import DeleteFileModal from "src/core/components/modals/delete-file-modal/delete-file-modal";
import { getFileIcon } from "src/core/utils";
import DataFilter from "src/layouts/admin/components/data-filter/data-filter";
import {
  dataFilterReducer,
  setFilterActive,
} from "src/layouts/admin/components/data-filter/data-filter.redux";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import { contractReducer, handleFileToOpen } from "../contract/contract.redux";
import { teamReducer } from "../manage-team/team.redux";
import { ReportFileType } from "../trash/trash.model";
import { exportToCSV } from "../user-dashboard/common-utility/utility-function";
import { EmptyComponent } from "../user-dashboard/empty-component/empty-component";
import "./contract-data-list.styles.scss";
import RequestedDownloadList from "./requested-download-list";

interface ContractDataListProps {}

const ContractDataList: React.FC<ContractDataListProps> = () => {
  const dispatch = useAppDispatch();
  // const navigate = useNavigate();
  // const [selectAll, setSelectAll] = useState(false);
  // const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [activeFileOption, setActiveFileOption] = useState(-1);
  const [deleteFile, setDeleteFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ReportFileType>();

  const [rows, setRows] = useState<Array<any>>([]);

  const {
    extractedContractReport,
    totalReportsCount,
    perPageReportsCount,
    contractReportHeaders = [],
  } = useAppSelector((state) => state.dashboardContract);

  const isLoading = useAppSelector((state) => state.dashboardContract.isLoading);
  // const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [paginationData, setPaginationData] = useState({
    totalItems: totalReportsCount || 0,
    currentPage: 1,
    itemsPerPage: perPageReportsCount,
  });
  const { itemsPerPage } = paginationData;
  const totalCount = totalReportsCount;
  // const pgn = extractedContractReport.pgn as number;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  // const handleSelectAll = () => {
  //   if (selectAll) {
  //     setSelectedItems([]);
  //   } else {
  //     const itemIds = rows.map((item) => item.id);
  //     setSelectedItems(itemIds);
  //   }
  //   setSelectAll((prevSelectAll) => !prevSelectAll);
  // };

  // const toggleItemSelection = (itemId: number) => {
  //   setSelectedItems((prevSelectedItems) => {
  //     if (prevSelectedItems.includes(itemId)) {
  //       return prevSelectedItems.filter((id) => id !== itemId);
  //     } else {
  //       return [...prevSelectedItems, itemId];
  //     }
  //   });
  // };

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: totalReportsCount,
      itemsPerPage: perPageReportsCount,
    });
  }, [totalReportsCount, perPageReportsCount]);

  const fetchData = async (pageNo: number, mergeResponse: boolean = false) => {
    try {
      await dispatch(getExtractedContractReport({ pageNo, mergeResponse }));
    } catch (error) {
      console.error("Error fetching data:", error);
      // Set an error state or show an error message to the user
    }
  };

  useEffect(() => {
    fetchData(paginationData.currentPage);

    return () => {
      dispatch(clearReportList());
    };
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      dispatch(getExtractedContractReport({ pageNo: newPage }));
    }
  };

  const handleExport = () => {
    const headerMapping = {
      companyId: "Company Id",
      contractCode: "Contract Code",
      contractDuration: "Contract Duration",
      contractFileId: "Contract FileId",
      contractType: "Contract Type",
      createdBy: "Created By",
      createdOn: "Created On",
      effectiveDate: "Effective Date",
      executionDate: "Execution Date",
      fileName: "File Name",
      firstParty: "First Party",
      governingLaw: "Governing Law",
      jurisdiction: "Jurisdiction",
      maximumLiability: "Maximum Liability",
      secondParty: "Second Party",
      terminationDate: "Termination Date",
    };
    exportToCSV(extractedContractReport, headerMapping);
  };

  // const columns = [
  //   // {
  //   //   key: "fileSelector",
  //   //   label: (
  //   //     <div className="file-item-selector">
  //   //       <input
  //   //         type="checkbox"
  //   //         checked={selectAll}
  //   //         onChange={handleSelectAll}
  //   //         onClick={(event) => event.stopPropagation()}
  //   //       />
  //   //     </div>
  //   //   ),
  //   //   isSorting: false,
  //   // },
  //   { key: "contractCode", label: "Code" },
  //   { key: "fileName", label: "Name" },
  //   { key: "tdGradient", label: "" },
  //   { key: "contractType", label: "Type" },
  //   { key: "firstParty", label: "First Party" },
  //   { key: "secondParty", label: "Second Party" },
  //   { key: "maximumLiability", label: "Max Liability Party" },
  //   { key: "effectiveDate", label: "Effective Date" },
  //   { key: "contractDuration", label: "Duration" },
  //   { key: "terminationDate", label: "Termination Date" },
  //   { key: "governingLaw", label: "Governing Law" },
  //   { key: "jurisdiction", label: "Jurisdiction" },
  //   { key: "createdOn", label: "Created On" },
  //   { key: "createdBy", label: "Created By" },
  //   { key: "fname", label: "", hidden: true },
  //   {
  //     key: "action",
  //     label: (
  //       <div className="file-list-action">
  //         <span className="">Action</span>
  //       </div>
  //     ),
  //     isSorting: false,
  //   },
  // ];

  const [columns, setColumns] = useState<Array<{ key: string; label: any; isSorting?: boolean }>>(
    [],
  );

  useEffect(() => {
    if (contractReportHeaders.length) {
      const headerList: Array<any> = [
        { key: contractReportHeaders[1].key, label: contractReportHeaders[1].value },
        { key: contractReportHeaders[0].key, label: contractReportHeaders[0].value },
        { key: "tdGradient", label: "" },
        ...contractReportHeaders
          .filter((_: any, index: number) => ![0, 1].includes(index))
          .map((data) => {
            const { key, value } = data || {};
            return { key, label: value };
          }),
        {
          key: "action",
          label: (
            <div className="file-list-action">
              <span className="">Action</span>
            </div>
          ),
          isSorting: false,
        },
      ];

      setColumns(headerList);
    }
  }, [contractReportHeaders]);

  const handleFileOption = (e: any, id: number) => {
    e.stopPropagation();
    setActiveFileOption(id);
  };

  const handleDeleteFile = (file: any) => {
    setActiveFileOption(-1);
    setDeleteFile(true);
    setSelectedFile(file);
  };

  const handleCloseDeleteModal = async () => {
    fetchData(paginationData.currentPage, true);
    setDeleteFile(false);
    setSelectedFile(undefined);
  };

  const dataGenerator = (data: any) => {
    const id = data.contractId;
    return {
      ...data,
      action: (
        <div className="file-list-action">
          <button className="icon-option-dot" onClick={(e) => handleFileOption(e, id)}></button>
          {activeFileOption === id && (
            <div className="dropdown-container">
              <div className="dropdown-box">
                <ul>
                  <li
                    onClick={() =>
                      dispatch(
                        handleFileToOpen({
                          id: Number(data.contractId),
                          folderId: Number(data.folderId),
                          status: data.processStatus,
                          teamId: Number(data.teamId),
                          fileName: data.fileName,
                          createdBy: data.createdBy,
                          mimeType: "application/pdf",
                        }),
                      )
                    }
                  >
                    View
                  </li>
                  <li
                    onClick={() => {
                      handleDeleteFile({ id: data.contractFileId, fileName: data.fileName });
                    }}
                  >
                    Archive
                  </li>
                </ul>
              </div>
              <div className="notch"></div>
            </div>
          )}
        </div>
      ),
      fileName: (
        <div
          className="file-col"
          onClick={() =>
            dispatch(
              handleFileToOpen({
                id: Number(data.contractId),
                folderId: Number(data.folderId),
                status: data.processStatus,
                teamId: Number(data.teamId),
                fileName: data.fileName,
                createdBy: data.createdBy,
                mimeType: "application/pdf",
              }),
            )
          }
        >
          <i className={`w-20 h-20 mr-2`}>
            <img
              className={`w-20 h-20`}
              src={require(`assets/images/icon-${getFileIcon(data.fileName, data.mimeType)}.svg`)}
            />
          </i>
          <div
            className="file-title-table inline-block overflow-hidden truncate-line1 lh1 rounded-6"
            data-fulltext={data.fileName}
          >
            {data.fileName}
          </div>
        </div>
      ),
    };
    // return {
    //   id: data.id,
    //   // fileSelector: (
    //   //   <div className="file-item-selector">
    //   //     <input
    //   //       type="checkbox"
    //   //       onChange={() => toggleItemSelection(data.id)}
    //   //       onClick={(event) => event.stopPropagation()}
    //   //       checked={selectedItems?.includes(data.id)}
    //   //     />
    //   //   </div>
    //   // ),
    //   contractCode: (
    //     <div className="flex items-center">
    //       <i className={`w-20 h-20 mr-2`}>
    //         <img src={require(`assets/images/icon-${getFileIcon(data.fileName)}.svg`)} />
    //       </i>
    //       {data.contractCode}
    //     </div>
    //   ),
    //   fileName: (
    //     <div
    //       className="flex items-center file-title-table inline-block overflow-hidden truncate-line1 lh1 rounded-6"
    //       onClick={() =>
    //         dispatch(
    //           handleFileToOpen({
    //             id: data.contractFileId,
    //             folderId: data.folderId,
    //             status: data.processStatus,
    //             teamId: data.teamId,
    //             fileName: data.fileName,
    //             createdBy: data.createdBy,
    //             mimeType: data.mimeType,
    //           }),
    //         )
    //       }
    //       data-fulltext={data.fileName}
    //     >
    //       {data.fileName}
    //     </div>
    //   ),
    //   tdGradient: (
    //     <div className="td-gradient">
    //       <div style={{ width: "10px" }}></div>
    //     </div>
    //   ),
    //   contractType: data.contractType,
    //   firstParty: data.firstParty,
    //   secondParty: data.secondParty,
    //   maximumLiability: data.maximumLiability,
    //   effectiveDate: data.effectiveDate,
    //   contractDuration: data.contractDuration,
    //   terminationDate: data.terminationDate,
    //   governingLaw: data.governingLaw,
    //   jurisdiction: data.jurisdiction,
    //   createdOn: data.createdOn,
    //   createdBy: data.createdBy,
    //   fname: data.fileName,
    //   action: (
    //     <div className="file-list-action">
    //       <button
    //         className="icon-option-dot"
    //         onClick={(e) => handleFileOption(e, data.id)}
    //       ></button>
    //       {activeFileOption === data.id && (
    //         <div className="dropdown-container">
    //           <div className="dropdown-box">
    //             <ul>
    //               <li
    //                 onClick={() =>
    //                   dispatch(
    //                     handleFileToOpen({
    //                       id: data.contractFileId,
    //                       folderId: data.folderId,
    //                       status: data.processStatus,
    //                       teamId: data.teamId,
    //                       fileName: data.fileName,
    //                       createdBy: data.createdBy,
    //                       mimeType: data.mimeType,
    //                     }),
    //                   )
    //                 }
    //               >
    //                 View
    //               </li>
    //               <li
    //                 onClick={() => {
    //                   handleDeleteFile({ id: data.contractFileId, fileName: data.fileName });
    //                 }}
    //               >
    //                 Archive
    //               </li>
    //             </ul>
    //           </div>
    //           <div className="notch"></div>
    //         </div>
    //       )}
    //     </div>
    //   ),
    // };
  };

  useEffect(() => {
    extractedContractReport && setRows(extractedContractReport?.map((data) => dataGenerator(data)));
  }, [extractedContractReport, activeFileOption]);

  useEffect(() => {
    window.addEventListener("click", () => {
      activeFileOption !== -1 && setActiveFileOption(-1);
    });
  }, [activeFileOption]);

  const handleFilter = async () => {
    await fetchData(paginationData.currentPage);
    dispatch(setFilterActive(true));
  };

  const initiateDownload = () => {
    dispatch(initiateDownloadRequest());
  };

  return (
    // <div className="dashboard-viewer">
    //   {isLoading && <Loader />}
    //   <div className="dashboard-viewer-wrapper">
    //     <div className="files-container">
    //       <div className="scroller">
    //         <div className="files-container-list">
    //           <div className="wrapper nobg">
    //             <h3>Files as a Table with Search</h3>
    //             <p className="meta">
    //               {totalCount ?? 0} Files
    //               {extractedContractReport?.result?.length > 0 && (
    //                 <button onClick={handleExport} className="add-export-btn">
    //                   Download Reports
    //                 </button>
    //               )}
    //             </p>
    //           </div>
    //           <DataTable
    //             data={rows}
    //             columns={columns}
    //             enableSorting={true}
    //             enableSearching={true}
    //             enablePagination={true}
    //             paginationData={paginationData}
    //             onPageChange={handlePageChange}
    //           />
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <>
      <div className="left-section left-divider-sec">
        <div className="left-section-inner" style={{ maxWidth: "100%", margin: "initial" }}>
          <section className="reports-section mb-6">
            {isLoading && <Loader />}

            <div className="flex mb-4 justify-between items-center">
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <DataFilter
                  handleFilter={handleFilter}
                  filterType={[
                    FILTER_TYPE.USER_LIST,
                    FILTER_TYPE.CONTRACT_TYPE,
                    FILTER_TYPE.DATE_RANGE,
                  ]}
                  activeFilterPath={[
                    `/${ROUTE_ADMIN}/${ROUTE_CONTRACT_VIEW}`,
                    `/${ROUTE_ADMIN}/${ROUTE_CONTRACT_LIST}`,
                  ]}
                />
              </div>
              <span className="grow"></span>
              {extractedContractReport?.length > 0 && (
                <button
                  onClick={initiateDownload}
                  className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                >
                  Download Request
                </button>
              )}
            </div>
            {rows.length ? (
              <div className="report-card rounded-6">
                <div className="table-outer-wrapper">
                  <div className="scrolling-lock-table-wrapper">
                    <DataTable
                      data={rows}
                      columns={columns}
                      paginationData={paginationData}
                      onPageChange={handlePageChange}
                      enablePagination={totalPages > 1}
                      enableSearching={true}
                      tableClassName="report-info-list"
                    />
                  </div>
                </div>
              </div>
            ) : (
              !isLoading && (
                <EmptyComponent messageOne={"Reports data not available"} text={"Reports"} />
              )
            )}
          </section>

          <RequestedDownloadList />
        </div>
      </div>
      {/* <div className="right-section">
        <NotificationStack />
      </div> */}
      {deleteFile && selectedFile && (
        <DeleteFileModal
          isOpen={deleteFile}
          onClose={handleCloseDeleteModal}
          shouldCloseOnOverlayClick={true}
          file={selectedFile}
        />
      )}
    </>
  );
};

export const reducer = {
  dashboardContract: dashboardContractReducer,
  contract: contractReducer,
  dataFilter: dataFilterReducer,
  team: teamReducer,
};

export default ContractDataList;
