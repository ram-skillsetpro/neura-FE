import { useAppDispatch, useAppSelector } from "core/hook";
import { formatDateWithOrdinal } from "core/utils/constant";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import "src/pages/user-dashboard/components/my-files/recent-files-view.scss";
import { PlaybookTrashList } from "../../trash.model";
import { fetchTrashPlayBookListing, restorePlaybook } from "../../trash.redux";

const TrashPlaybookListing: React.FC = () => {
  const dispatch = useAppDispatch();
  const trashPBList = useAppSelector((state) => state.trash.trashPBList);
  const isLoading = useAppSelector((state) => state.trash.trashPBFilesResponse.isLoading);
  const [activeFileOption, setActiveFileOption] = useState(-1);
  const [rows, setRows] = useState<Array<any>>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const trashPBFilesResponse = useAppSelector((state) => state.trash.trashPBFilesResponse);

  const [paginationData, setPaginationData] = useState({
    totalItems: (trashPBFilesResponse?.totct ?? 0) as number,
    currentPage: 1,
    itemsPerPage: trashPBFilesResponse.perpg,
  });

  const { itemsPerPage } = paginationData;
  const totalCount = (trashPBFilesResponse?.totct ?? 0) as number;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  const getCurrentPageNumber = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      dispatch(fetchTrashPlayBookListing(newPage));
    }
  };

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: (trashPBFilesResponse?.totct ?? 0) as number,
      itemsPerPage: trashPBFilesResponse.perpg,
      currentPage: trashPBFilesResponse.pgn,
    });
  }, [trashPBFilesResponse]);

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
  }, [trashPBList]);

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
    { key: "updatedOn", label: "Last Modified", isSorting: false },
    {
      key: "action",
      label: (
        <div className="file-list-action">
          <span className="file-action">Action</span>
        </div>
      ),
      isSorting: false,
    },
  ];

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(itemId)) {
        return prevSelectedItems.filter((id) => id !== itemId);
      } else {
        return [...prevSelectedItems, itemId];
      }
    });
  };

  const handleFileOption = (e: any, id: number) => {
    e.stopPropagation();
    setActiveFileOption(id);
  };

  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveFileOption(-1);
    });
  }, []);

  useEffect(() => {
    setRows(trashPBList?.map((data) => dataGenerator(data)));
  }, [trashPBList, activeFileOption, selectedItems]);

  const handleRestorePlaybook = (id: number) => {
    const pgn =
      rows.length > 1
        ? paginationData.currentPage
        : paginationData.currentPage === 1
          ? paginationData.currentPage
          : paginationData.currentPage - 1;
    dispatch(restorePlaybook(id, pgn));
  };

  const dataGenerator = (data: PlaybookTrashList) => {
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
          <div
            className="flex items-center file-title-table inline-block overflow-hidden truncate-line1 lh1 rounded-6"
            data-fulltext={data.playbookName}
          >
            {data.playbookName}
          </div>
        </div>
      ),
      updatedOn: (
        <div className="file-list-modified fs12">
          {data.updatedBy
            ? formatDateWithOrdinal(new Date(data.updatedBy * 1000))
            : formatDateWithOrdinal(new Date(data.updatedBy * 1000))}
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
                  <li className="border-bottom" onClick={() => handleRestorePlaybook(data.id)}>
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
    <AnimatePresence mode="wait">
      {rows.length > 0 && (
        <section className="mb-5">
          <div className="flex view-all-header mb-3 items-center">
            <h2 className="fs10 text-defaul-color font-normal tracking-wider uppercase ml-3">
              Trash Playbook
            </h2>
          </div>
          <motion.div
            exit={{ opacity: 0, y: -100 }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DataTable
              className="file-list-card rounded-6 other-files-view"
              data={rows}
              columns={columns}
              enablePagination={totalPages > 1}
              isLoading={isLoading ?? false}
              paginationData={paginationData}
              onPageChange={getCurrentPageNumber}
            />
          </motion.div>
        </section>
      )}
    </AnimatePresence>
  );
};

export default TrashPlaybookListing;
