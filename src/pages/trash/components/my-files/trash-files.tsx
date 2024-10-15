import { useAppDispatch, useAppSelector } from "core/hook";
import { formatDateWithOrdinal } from "core/utils/constant";
import React, { useEffect, useMemo, useState } from "react";
import { getFileIcon } from "src/core/utils";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import "src/pages/trash/components/file-option.styles.scss";
import { FileType } from "../../trash.model";
import { getTrashFilePerPage, restoreAllFile, restoreDeletedFiles } from "../../trash.redux";
import "./trash-files.scss";
interface TrashFilesViewProps {}

const TrashFiles: React.FC<TrashFilesViewProps> = () => {
  const fileList = useAppSelector((state) => state.trash.fileList);
  const isLoading = useAppSelector((state) => state.trash.filesResponse.isLoading);
  const [activeFileOption, setActiveFileOption] = useState(-1);

  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<Array<any>>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setSelectAll(checked);
    if (checked) {
      const newVisibleItemIds = rows.map((item) => item.id);
      const uniqueItems = Array.from(new Set([...selectedItems, ...newVisibleItemIds]));
      setSelectedItems(uniqueItems);
    } else {
      const visibleItemIds = rows.map((item) => item.id);
      const remainingSelectedItems = selectedItems.filter((id) => !visibleItemIds.includes(id));
      setSelectedItems(remainingSelectedItems);
    }
  };

  useEffect(() => {
    const visibleItemIds = rows.map((item) => item.id);
    const allSelected = visibleItemIds.every((id) => selectedItems.includes(id));
    setSelectAll(allSelected);
  }, [rows, selectedItems]);

  useEffect(() => {
    setSelectAll(false);
  }, [fileList]);

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(itemId)) {
        return prevSelectedItems.filter((id) => id !== itemId);
      } else {
        return [...prevSelectedItems, itemId];
      }
    });
  };

  const restoreAllFiles = () => {
    if (selectedItems.length > 0) {
      dispatch(restoreAllFile({ fileIds: selectedItems.join(",") }));
    }
  };

  const columns = [
    {
      key: "fileSelector",
      label: (
        <div className="file-item-selector">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ),
      isSorting: false,
    },
    {
      key: "fileName",
      label: "Name",
      isSorting: false,
    },
    { key: "updatedOn", label: "Deleted Date", isSorting: false },
    {
      key: "action",
      label: (
        <div className="file-list-action  capitalize">
          <div className="icon-option-wrap">
            <button className="icon-option-dot" onClick={(e) => handleFileOption(e, 0)}></button>
          </div>
          <div className="action-tool-tip">Bulk action</div>
          {activeFileOption === 0 && (
            <div className="dropdown-container">
              <div className="dropdown-box" style={{ width: "auto" }}>
                {selectedItems.length > 0 ? (
                  <ul>
                    <li onClick={restoreAllFiles} className={`border-bottom`}>
                      Restore All
                    </li>
                  </ul>
                ) : (
                  <ul>
                    <li className={`border-bottom`}>
                      <div className="text-help">
                        Select items for <br />
                        bulk action
                      </div>
                    </li>
                  </ul>
                )}
              </div>
              <div className="notch"></div>
            </div>
          )}
        </div>
      ),
      isSorting: false,
    },
  ];

  const filesAllData = useAppSelector((state) => state.trash.filesResponse);
  const [paginationData, setPaginationData] = useState({
    totalItems: filesAllData.totct as number,
    currentPage: 1,
    itemsPerPage: filesAllData.perpg,
  });
  const handleFileOption = (e: any, id: number) => {
    e.stopPropagation();
    setActiveFileOption(id);
  };

  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveFileOption(-1);
    });
  }, []);

  const { itemsPerPage } = paginationData;
  const totalCount = filesAllData.totct as number;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  const getCurrentPageNumber = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      dispatch(getTrashFilePerPage(newPage));
    }
  };

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: filesAllData.totct as number,
      itemsPerPage: filesAllData.perpg,
    });
  }, [filesAllData]);

  useEffect(() => {
    setRows(fileList?.map((data) => dataGenerator(data)));
  }, [fileList, activeFileOption, selectedItems]);

  const handleRestore = (id: number) => {
    const pgn =
      rows.length > 1
        ? paginationData.currentPage
        : paginationData.currentPage === 1
          ? paginationData.currentPage
          : paginationData.currentPage - 1;
    dispatch(restoreDeletedFiles(id, pgn));
  };

  const dataGenerator = (data: FileType) => {
    return {
      id: data.id,
      fileSelector: (
        <div className="file-item-selector">
          <input
            type="checkbox"
            onChange={() => toggleItemSelection(data.id)}
            onClick={(event) => event.stopPropagation()}
            checked={selectedItems?.includes(data.id)}
          />
        </div>
      ),
      fileName: (
        <div className="file-list-name fs12 flex items-center">
          <i className={`w-20 h-20 mr-2`}>
            <img
              src={require(`assets/images/icon-${getFileIcon(data.fileName, data.mimeType)}.svg`)}
            />
          </i>
          <div
            className="flex items-center file-title-table inline-block overflow-hidden truncate-line1 lh1 rounded-6"
            data-fulltext={data.fileName}
          >
            {data.fileName}
          </div>
        </div>
      ),
      updatedOn: (
        <div className="file-list-modified fs12">
          {data.updatedOn
            ? formatDateWithOrdinal(new Date(data.updatedOn * 1000))
            : formatDateWithOrdinal(new Date(data.createdOn * 1000))}
        </div>
      ),
      action: (
        <div className="file-list-action">
          <button
            className="icon-option-dot"
            onClick={(e) => handleFileOption(e, data.id)}
          ></button>
          {activeFileOption === data.id && (
            <div className="dropdown-container">
              <div className="dropdown-box">
                <ul>
                  <li className="border-bottom" onClick={() => handleRestore(data.id)}>
                    Restore
                  </li>
                </ul>
              </div>
              <div className="notch"></div>
            </div>
          )}
        </div>
      ),
    };
  };

  return (
    <>
      {rows && rows.length > 0 ? (
        <section className="mb-5">
          <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
            Trash Files
          </h2>
          <DataTable
            className="file-list-card rounded-6 other-files-view"
            data={rows}
            columns={columns}
            paginationData={paginationData}
            onPageChange={getCurrentPageNumber}
            enablePagination={totalPages > 1}
            isLoading={isLoading ?? false}
          />
        </section>
      ) : (
        <></>
        // isLoading === false && fileList.length === 0 && <NoDataPage pathname={location.pathname} />
      )}
    </>
  );
};

export default TrashFiles;
