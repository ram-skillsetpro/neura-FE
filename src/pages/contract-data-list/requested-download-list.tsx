import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { getShortUsername, getUsernameColor } from "src/core/utils";
import { formatDateWithOrdinal } from "src/core/utils/constant";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import { fetchDownloadFile, fetchRequestedDownloadList } from "./contract-data-list.redux";
import "./requested-download-list.scss";

const RequestedDownloadList: React.FC = () => {
  const dispatch = useAppDispatch();

  const [rows, setRows] = useState<Array<any>>([]);

  const { requestedDownloadList, totalRequestedDownloadCount, perPageRequestedDownloadCount } =
    useAppSelector((state) => state.dashboardContract);

  const [paginationData, setPaginationData] = useState({
    totalItems: totalRequestedDownloadCount || 0,
    currentPage: 1,
    itemsPerPage: perPageRequestedDownloadCount,
  });

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: totalRequestedDownloadCount,
      itemsPerPage: perPageRequestedDownloadCount,
    });
  }, [totalRequestedDownloadCount, perPageRequestedDownloadCount]);

  const columns = [
    { key: "name", label: "Name" },
    { key: "updatedOn", label: "Requested On" },
    { key: "updatedBy", label: "Requested By" },
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

  const fetchList = () => {
    dispatch(fetchRequestedDownloadList({ pageNo: paginationData.currentPage }));
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    const pendingTasks = requestedDownloadList.filter((d) => [1, 2].includes(d.processStatus));

    const intervalId = setInterval(() => {
      if (pendingTasks.length) {
        fetchList();
      } else {
        clearInterval(intervalId);
      }
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [requestedDownloadList]);

  const handleDownload = (data: any) => {
    const { id: reportId } = data;
    dispatch(fetchDownloadFile({ reportId }));
  };

  const renderStatus = (data: any) => {
    if ([1, 2].includes(data.processStatus)) {
      return (
        <div className="action-btn-new">
          <div className="file-processing file-processing-wrap flex justify-center">
            <i className="icon-pro processing" />
            <div className="tool-file-error rounded-6" style={{ right: "80%" }}>
              Download is <br />
              being processed
            </div>
          </div>
        </div>
      );
    } else if ([3].includes(data.processStatus)) {
      return (
        <div className="action-btn-new">
          <button
            onClick={() => handleDownload(data)}
            className="download-button cursor-pointer"
          ></button>
        </div>
      );
    } else if ([4].includes(data.processStatus)) {
      return (
        <div className="action-btn-new">
          <div className="file-processing file-processing-wrap flex justify-center">
            <i className="icon-pro" />
            <div className="tool-file-error rounded-6" style={{ right: "80%" }}>
              Error occurred
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const dataGenerator = (data: any) => {
    return {
      name: data.filter,
      updatedOn: formatDateWithOrdinal(new Date(data.updatedOn * 1000)),
      updatedBy: (
        <div className="requested-by">
          <div
            className="ic-member tool-tip-wrap"
            style={{ backgroundColor: getUsernameColor(data?.userMeta?.userName) || "" }}
          >
            {getShortUsername(data?.userMeta?.userName)}
            <div className="tool-tip-card rounded-6">
              <div className="block font-bold">{data?.userMeta?.userName}</div>
            </div>
          </div>
        </div>
      ),
      action: renderStatus(data),
    };
  };

  useEffect(() => {
    requestedDownloadList && setRows(requestedDownloadList?.map((data) => dataGenerator(data)));
  }, [requestedDownloadList]);

  const { itemsPerPage } = paginationData;
  const totalCount = totalRequestedDownloadCount;
  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      dispatch(fetchRequestedDownloadList({ pageNo: newPage }));
    }
  };

  return Array.isArray(requestedDownloadList) && requestedDownloadList.length ? (
    <section className="relative mt-5 mb-4">
      <div className="flex view-all-header mb-3 items-center">
        <h2 className="fs10 text-defaul-color font-normal tracking-wider uppercase ml-3">
          Download History
        </h2>
      </div>
      <div className="report-card rounded-6">
        <DataTable
          data={rows}
          columns={columns}
          paginationData={paginationData}
          onPageChange={handlePageChange}
          enablePagination={totalPages > 1}
          // enableSearching={true}
          className="download-history"
        />
      </div>
    </section>
  ) : null;
};

export default RequestedDownloadList;
