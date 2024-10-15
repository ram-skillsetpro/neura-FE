import { useAppDispatch, useAppSelector } from "core/hook";
import { formatDateWithOrdinal } from "core/utils/constant";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TOAST } from "src/const";
import { Toaster } from "src/core/models/toaster.model";
import { encodePlaybookId } from "src/core/utils";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import "src/pages/user-dashboard/components/my-files/recent-files-view.scss";
import { PlaybookTypeList, copyPlaybookPayload } from "../playbook.model";
import { copyGlobalPlaybook, fetchPlayBookListing } from "../playbook.redux";
import PlayBookName from "./playbook-name";

const GlobalPlaybookListing: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const globalPBList = useAppSelector((state) => state.playbook.globalPBList);
  const isLoading = useAppSelector((state) => state.playbook.isGlobalPlaybookListLoading);
  const [activeFileOption, setActiveFileOption] = useState(-1);
  const [rows, setRows] = useState<Array<any>>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [playbookName, setPlayBookName] = useState(false);
  const [selectedPbId, setselectedPbId] = useState(0);

  const globalPBFilesResponse = useAppSelector((state) => state.playbook.globalPBFilesResponse);

  const [paginationData, setPaginationData] = useState({
    totalItems: (globalPBFilesResponse?.totct ?? 0) as number,
    currentPage: 1,
    itemsPerPage: globalPBFilesResponse.perpg,
  });

  const { itemsPerPage } = paginationData;
  const totalCount = (globalPBFilesResponse?.totct ?? 0) as number;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  const getCurrentPageNumber = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      dispatch(fetchPlayBookListing(1, newPage));
    }
  };

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: (globalPBFilesResponse?.totct ?? 0) as number,
      itemsPerPage: globalPBFilesResponse.perpg,
      currentPage: globalPBFilesResponse.pgn,
    });
  }, [globalPBFilesResponse]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      const itemIds = rows.map((item) => item.id);
      setSelectedItems(itemIds);
    }
    setSelectAll((prevSelectAll) => !prevSelectAll);
  };

  const handleGeneratePlayBookName = (e: any, id: number) => {
    setPlayBookName(true);
    setselectedPbId(id);
  };

  const handleAddPlaybookList = async (playBookName: string) => {
    const payloadCopyPlaybook: copyPlaybookPayload = {
      id: selectedPbId,
      playbookName: playBookName,
    };
    await dispatch(copyGlobalPlaybook(payloadCopyPlaybook, paginationData.currentPage));
  };

  const OpenPlaybook = (file: any) => {
    const flag = true;
    if (!file.id) {
      window.dispatchEvent(
        new CustomEvent<Toaster>(TOAST, {
          detail: {
            type: "error",
            message: "playbook id is missing",
          },
        }),
      );
    }

    if (flag && file.status === 3) {
      const encodedString = encodePlaybookId(file);
      navigate("/admin/view-globalPlaybook?key=" + encodedString);
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
    console.log(globalPBList.length);
    setRows(globalPBList?.map((data) => dataGenerator(data)));
  }, [globalPBList, activeFileOption, selectedItems]);

  const dataGenerator = (data: PlaybookTypeList) => {
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
            onClick={() =>
              OpenPlaybook({
                id: data.id,
                status: data.processStatus,
              })
            }
            data-fulltext={data.playbookName}
          >
            {data.playbookName}
          </div>
        </div>
      ),
      updatedOn: (
        <div className="file-list-modified fs12">
          {data.updatedOn
            ? formatDateWithOrdinal(new Date(data.updatedOn * 1000))
            : formatDateWithOrdinal(new Date(data.updatedOn * 1000))}
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
                  <li
                    onClick={() =>
                      OpenPlaybook({
                        id: data.id,
                        status: data.processStatus,
                      })
                    }
                    className="border-bottom"
                  >
                    View
                  </li>
                  <li
                    className="border-bottom"
                    onClick={(e) => handleGeneratePlayBookName(e, data.id)}
                  >
                    Copy
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
        <>
          <section className="mb-5 playbook">
            <div className="flex view-all-header mb-3 items-center">
              <h2 className="fs10 text-defaul-color font-normal tracking-wider uppercase ml-3">
                Global Playbook
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
                isLoading={isLoading}
                paginationData={paginationData}
                onPageChange={getCurrentPageNumber}
              />
            </motion.div>
          </section>
          {playbookName && (
            <PlayBookName
              isOpen={playbookName}
              onClose={() => setPlayBookName(false)}
              shouldCloseOnOverlayClick={true}
              handleAddPlaybookList={handleAddPlaybookList}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default GlobalPlaybookListing;
