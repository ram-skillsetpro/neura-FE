import { useAppDispatch, useAppSelector } from "core/hook";
import { encodePlaybookId, getShortUsername, getUsernameColor } from "core/utils";
import { formatDateWithOrdinal } from "core/utils/constant";
import { AnimatePresence, motion } from "framer-motion";
import "pages/user-dashboard/components/my-files/other-files-view.scss";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TOAST } from "src/const";
import { Toaster } from "src/core/models/toaster.model";
import useLocalStorage from "src/core/utils/use-local-storage";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import { AuthResponse } from "src/pages/auth/auth.model";
import "src/pages/user-dashboard/components/my-files/recent-files-view.scss";
import { PlaybookTypeList, copyPlaybookPayload } from "../playbook.model";
import {
    copyPlaybook,
    deletePlaybook,
    fetchPlayBookListing,
    publishPlaybook,
    updatePlayBookStatus,
} from "../playbook.redux";
import PlayBookName from "./playbook-name";

const PlaybookListing: React.FC = () => {
  const [auth] = useLocalStorage<AuthResponse>("auth");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const PBList = useAppSelector((state) => state.playbook.PBList);
  const isLoading = useAppSelector((state) => state.playbook.isGlobalPlaybookListLoading);
  const [activeFileOption, setActiveFileOption] = useState(-1);
  const [rows, setRows] = useState<Array<any>>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [playbookName, setPlayBookName] = useState(false);
  const [selectedPbId, setselectedPbId] = useState(0);
  const PBFilesResponse = useAppSelector((state) => state.playbook.PBFilesResponse);

  const [paginationData, setPaginationData] = useState({
    totalItems: (PBFilesResponse?.totct ?? 0) as number,
    currentPage: 1,
    itemsPerPage: PBFilesResponse.perpg,
  });

  const { itemsPerPage } = paginationData;
  const totalCount = (PBFilesResponse?.totct ?? 0) as number;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  const getCurrentPageNumber = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      dispatch(fetchPlayBookListing(0, newPage));
    }
  };

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: (PBFilesResponse?.totct ?? 0) as number,
      itemsPerPage: PBFilesResponse.perpg,
      currentPage: PBFilesResponse.pgn,
    });
  }, [PBFilesResponse]);

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
    await dispatch(copyPlaybook(payloadCopyPlaybook, paginationData.currentPage));
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
    { key: "createdBy", label: "Created by", isSorting: false },
    { key: "state", label: "State", isSorting: false },
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
    setRows(PBList?.map((data) => dataGenerator(data)));
  }, [PBList, activeFileOption, selectedItems]);

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
      if (auth.profileId === file.createdBy) {
        navigate("/admin/view-playbook?key=" + encodedString);
      } else {
        navigate("/admin/list-playbook?key=" + encodedString);
      }
    }
  };

  const handlePublishPlaybook = (id: number) => {
    const pgn =
      rows.length > 1
        ? paginationData.currentPage
        : paginationData.currentPage === 1
          ? paginationData.currentPage
          : paginationData.currentPage - 1;
    dispatch(publishPlaybook(id, pgn));
  };

  const handleDeletePlaybook = (id: number) => {
    const pgn =
      rows.length > 1
        ? paginationData.currentPage
        : paginationData.currentPage === 1
          ? paginationData.currentPage
          : paginationData.currentPage - 1;
    dispatch(deletePlaybook(id, pgn));
  };

  useEffect(() => {
    const checkProcessStatus = async () => {
      const checkPbProcessStatus = PBList.filter(
        (item) => item.processStatus === 1 || item.processStatus === 2,
      );
      if (checkPbProcessStatus.length > 0) {
        const playbookIds = checkPbProcessStatus.map((item) => item.id).join(",");
        const updatedStatusItems = await dispatch(updatePlayBookStatus(playbookIds));

        if (
          updatedStatusItems?.some(
            (item: { processStatus: number }) =>
              item.processStatus === 3 || item.processStatus === 4,
          )
        ) {
          const newPage = paginationData.currentPage;
          dispatch(fetchPlayBookListing(1, newPage));
        }
      }
    };

    const intervalId = setInterval(checkProcessStatus, 5000);

    return () => clearInterval(intervalId);
  }, [PBList, paginationData.currentPage]);

  function getSharedWithUser(user: { id: number; userName: string; logoUrl: string }) {
    return (
      <li key={user.id}>
        <div
          className="ic-member tool-tip-wrap"
          style={{
            backgroundColor:
              user?.logoUrl === "" ? getUsernameColor(user.userName) || "" : "initial",
          }}
        >
          {user?.logoUrl !== "" ? <img src={user.logoUrl} /> : `${getShortUsername(user.userName)}`}
          <div className="tool-tip-card rounded-6">
            <div className="block font-bold">{user.userName}</div>
          </div>
        </div>
      </li>
    );
  }

  const dataGenerator = (data: PlaybookTypeList) => {
    return {
      id: data.id,
      processStatus: data.processStatus,
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
            onClick={() => {
              if (data.processStatus === 3) {
                OpenPlaybook({
                  id: data.id,
                  status: data.processStatus,
                  createdBy: data.createdBy,
                });
              }
            }}
            data-fulltext={data.playbookName}
          >
            {(data as PlaybookTypeList).processStatus === 1 && (
              <span className="new-file-upload">New -</span>
            )}
            {data.processStatus === 4 && <span className="new-file-upload">Error -</span>}
            {data.playbookName}
          </div>
          {(data as PlaybookTypeList).processStatus === 4 && (
            <div className="file-processing file-processing-wrap">
              <i className="icon-pro"></i>
              <div className="tool-file-error rounded-6">Error occurred in Playbook Generation</div>
            </div>
          )}
          {(data as PlaybookTypeList).processStatus === 1 && (
            <div className="file-processing file-processing-wrap">
              <i className="icon-pro processing"></i>
              <div className="tool-file-error rounded-6">Playbook Generation process in queue</div>
            </div>
          )}
          {(data as PlaybookTypeList).processStatus === 2 && (
            <div className="file-processing file-processing-wrap">
              <i className="icon-pro processing"></i>
              <div className="tool-file-error rounded-6">Playbook Generation process initiated</div>
            </div>
          )}
        </div>
      ),
      createdBy: (
        <div className="file-list-shared fs12">
          <div className="flex">
            <div className="sharing-members li-overlap">
              <ul>
                {(data.userLogoUrl === null || data.userLogoUrl === undefined) && "-"}
                {data &&
                  data?.userLogoUrl &&
                  getSharedWithUser({
                    id: data.id,
                    userName: data.userName,
                    logoUrl: data.userLogoUrl,
                  })}
              </ul>
            </div>
          </div>
        </div>
      ),
      state: (
        <div className="file-list-modified fs12">
          {data.isPublished === 0 ? "Draft" : "Published"}
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
                  {data.processStatus === 3 ? (
                    <li
                      onClick={() =>
                        OpenPlaybook({
                          id: data.id,
                          status: data.processStatus,
                          createdBy: data.createdBy,
                        })
                      }
                      className="border-bottom"
                    >
                      View
                    </li>
                  ) : (
                    <li className={"file-not-ready-to-share border-bottom"}>View</li>
                  )}
                  {data.isPublished === 0 ? (
                    <li className="border-bottom" onClick={() => handlePublishPlaybook(data.id)}>
                      Publish
                    </li>
                  ) : (
                    <li className={"file-not-ready-to-share border-bottom"}>Publish</li>
                  )}

                  {auth.profileId === data.createdBy ? (
                    <li className="border-bottom" onClick={() => handleDeletePlaybook(data.id)}>
                      Delete
                    </li>
                  ) : (
                    <li className={"file-not-ready-to-share border-bottom"}>Delete</li>
                  )}
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
                My Playbook
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

export default PlaybookListing;
