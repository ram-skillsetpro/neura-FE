import DeleteFileModal from "core/components/modals/delete-file-modal/delete-file-modal";
import { useAppDispatch, useAppSelector } from "core/hook";
import { Toaster } from "core/models/toaster.model";
import {
  encodeFilePreContractKey,
  getFileIcon,
  getShortUsername,
  getUsernameColor,
} from "core/utils";
import {
  LS_DRAFT_FOLDERS_ROUTE,
  formatDateWithOrdinal,
  sharedUsersCount,
} from "core/utils/constant";
import useLocalStorage from "core/utils/use-local-storage";
import { AnimatePresence, motion } from "framer-motion";
import {
  StateValue,
  getLastArrayFromLocalStorage,
  getStateString,
} from "pages/user-dashboard/common-utility/utility-function";
import "pages/user-dashboard/components/my-files/other-files-view.scss";
import "pages/user-dashboard/components/my-files/recent-files-view.scss";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PRE_DRAFTS, TOAST, USER_AUTHORITY } from "src/const";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import { AuthResponse } from "src/pages/auth/auth.model";
import { DraftType } from "./drafts.model";
import { deleteDraft, getDraftListData } from "./drafts.redux";
interface DraftsFilesViewProps {
  isFilterActive?: boolean;
}

const DraftFileView: React.FC<DraftsFilesViewProps> = ({ isFilterActive }) => {
  const roleSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);
  const [auth] = useLocalStorage<AuthResponse>("auth");
  const navigate = useNavigate();
  const draftList = useAppSelector((state) => state.drafts?.draftList); // useAppSelector((state) => state.dashboard.draftList);
  // const draftList = useAppSelector((state) => state.drafts?.draftList);

  const [activeFileOption, setActiveFileOption] = useState(-1);
  const [deleteFile, setDeleteFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DraftType>();
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<Array<any>>([]);
  const [newFile, setNewFile] = useState<Array<number>>([]);
  const draftListResp = useAppSelector((state) => state.drafts?.draftResponse);
  const isLoading = useAppSelector((state) => state.drafts.isLoading);

  const [paginationData, setPaginationData] = useState({
    totalItems: draftListResp.totct as number,
    currentPage: 1,
    itemsPerPage: draftListResp.perpg,
  });

  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // const handleSelectAll = () => {
  //   if (selectAll) {
  //     setSelectedItems([]);
  //   } else {
  //     const itemIds = rows.map((item) => item.id);
  //     setSelectedItems(itemIds);
  //   }
  //   setSelectAll((prevSelectAll) => !prevSelectAll);
  // };
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
    setSelectAll(false);
  }, [draftList]);

  useEffect(() => {
    const visibleItemIds = rows.map((item) => item.id);
    const allSelected = visibleItemIds.every((id) => selectedItems.includes(id));
    setSelectAll(allSelected);
  }, [rows, selectedItems]);

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
      key: "preContractName",
      label: "Name",
      isSorting: false,
    },
    { key: "state", label: "Stage", isSorting: false },
    { key: "createdOn", label: "Last Modified", isSorting: false },
    { key: "draftOwner", label: "Owner", isSorting: false },
    { key: "sharedWith", label: "Shared With", isSorting: false },
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

  const { itemsPerPage } = paginationData;
  const totalCount = draftListResp.totct as number;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  const getCurrentPageNumber = async (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      const folder = getLastArrayFromLocalStorage(LS_DRAFT_FOLDERS_ROUTE);
      const payload = {
        currentPage: newPage,
        folder,
      };
      await dispatch(getDraftListData(payload));
    }
  };

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: draftListResp.totct as number,
      itemsPerPage: draftListResp.perpg,
    });
  }, [draftListResp]);

  useEffect(() => {
    if (newFile) {
      localStorage.removeItem("processStatusNew");
    }
  }, []);

  useEffect(() => {
    setRows(draftList?.map((data) => dataGenerator(data)));
  }, [draftList, activeFileOption, selectedItems, newFile]);

  const openFile = (file: any) => {
    const flag = true;
    if (!file.contractId) {
      window.dispatchEvent(
        new CustomEvent<Toaster>(TOAST, {
          detail: {
            type: "error",
            message: "Contract id is missing",
          },
        }),
      );
    }

    if (flag && file.isActive === 1) {
      const encodedString = encodeFilePreContractKey(file);
      navigate("/admin/pre-contract?key=" + encodedString);
    }
  };

  const handleUserProfile = (data: number) => {
    const authData = localStorage.getItem("auth");
    let UserCheck, buttonAction;
    if (authData) {
      const parsedAuthData = JSON.parse(authData);
      if (parsedAuthData.profileId === data) {
        UserCheck = true;
        buttonAction = true;
        navigate("/admin/settings", {
          state: { showData: UserCheck, buttonAction },
        });
      } else {
        UserCheck = !!roleSuperAdmin;
        buttonAction = false;
        navigate("/admin/settings", {
          state: { showData: UserCheck, buttonAction, profileId: data },
        });
      }
    }
  };

  function getSharedWithUser(user: { id: number; userName: string; logoUrl: string }) {
    return (
      <li key={user.id} onClick={() => handleUserProfile(user.id)}>
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

  const handleDeleteFile = async (data: any) => {
    const draftId = data?.contractId;
    await dispatch(deleteDraft(draftId));
  };

  const handleCloseDeleteModal = async () => {
    setDeleteFile(false);
    setSelectedFile(undefined);
  };

  const dataGenerator = (data: DraftType) => {
    return {
      id: data.contractId,
      processStatus: data.processStatus,
      fileSelector: (
        <div className="file-item-selector">
          <input
            type="checkbox"
            onChange={() => toggleItemSelection(data.contractId)}
            onClick={(event) => event.stopPropagation()}
            checked={selectedItems.includes(data.contractId)}
          />
        </div>
      ),
      preContractName: (
        <div
          className="file-list-name fs12 flex items-center"
          onClick={() =>
            openFile({
              contractId: (data as DraftType).contractId,
              state: (data as DraftType).state,
              folderId: (data as DraftType).folderId,
              isActive: (data as DraftType).isActive,
              preContractName: (data as DraftType).preContractName,
            })
          }
        >
          <i className={`w-20 h-20 mr-2`}>
            <img
              src={require(
                `assets/images/icon-${getFileIcon(data.preContractName, data.mimeType)}.svg`,
              )}
            />
          </i>
          <div
            className="flex items-center file-title-table inline-block overflow-hidden truncate-line1 lh1 rounded-6"
            data-fulltext={data.preContractName}
          >
            {data.preContractName}
          </div>
        </div>
      ),
      state: (
        <div className="file-list-modified fs12">{getStateString(data.state as StateValue)}</div>
      ),
      createdOn: (
        <div className="file-list-modified fs12">
          {data.createdOn ? formatDateWithOrdinal(new Date(data.createdOn * 1000)) : "-"}
        </div>
      ),
      draftOwner: (
        <div className="file-list-shared fs12">
          <div className="flex">
            <div className="sharing-members li-overlap">
              <ul>
                {(data.owner === null || data.owner === undefined) && "-"}
                {data && data?.owner && getSharedWithUser(data?.owner)}
              </ul>
            </div>
          </div>
        </div>
      ),
      sharedWith: (
        <div className="file-list-shared fs12">
          <div className="flex">
            <div className="sharing-members li-overlap">
              <ul>
                {data.userMetas === null && "-"}
                {data.userMetas && data.userMetas?.length <= sharedUsersCount
                  ? data?.userMetas?.map((user) => getSharedWithUser(user))
                  : data?.userMetas
                      ?.slice(0, sharedUsersCount)
                      .map((user) => getSharedWithUser(user))}
                {data.userMetas && data.userMetas?.length > sharedUsersCount && (
                  <li>
                    <div className="share-list-wrap">
                      <div className="shared-all">+{data.userMetas?.length - sharedUsersCount}</div>
                      <div className="shared-all-list">
                        {data.userMetas
                          ?.slice(-(data.userMetas?.length - sharedUsersCount))
                          .map((user) => (
                            <div
                              className="shared-all-row fs11 font-bold items-center"
                              key={user.id}
                            >
                              <i className="u-img-size mr-4 rounded-full">
                                {user?.logoUrl !== "" ? (
                                  <img src={user.logoUrl} />
                                ) : (
                                  <div
                                    className="ic-member"
                                    style={{
                                      backgroundColor:
                                        user?.logoUrl === ""
                                          ? getUsernameColor(user.userName) || ""
                                          : "initial",
                                    }}
                                  >
                                    {user?.userName !== "" && getShortUsername(user.userName)}
                                  </div>
                                )}
                              </i>
                              <span className="truncate-line1">{user.userName}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      ),
      action: (
        <div className="file-list-action">
          <button
            className="icon-option-dot"
            onClick={(e) => handleFileOption(e, data.contractId)}
          ></button>
          {activeFileOption === data.contractId && (
            <div className="dropdown-container">
              <div className="dropdown-box">
                <ul>
                  {data.state === 6 ? (
                    <li className={`border-bottom disabled`}>Edit Contract</li>
                  ) : (
                    <li
                      className="border-bottom"
                      onClick={() =>
                        openFile({
                          contractId: (data as DraftType).contractId,
                          state: (data as DraftType).state,
                          folderId: (data as DraftType).folderId,
                          isActive: (data as DraftType).isActive,
                          preContractName: (data as DraftType).preContractName,
                        })
                      }
                    >
                      Open Contract
                    </li>
                  )}
                  {auth.profileId !== data.createdby || data.state === 6 ? (
                    <li className={`border-bottom disabled`}>Delete Contract</li>
                  ) : (
                    <li className="border-bottom" onClick={() => handleDeleteFile(data)}>
                      Delete Contract
                    </li>
                  )}
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
          <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
            My Drafts
          </h2>
          <motion.div
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <DataTable
              className="file-list-card rounded-6 other-files-view"
              data={rows}
              columns={columns}
              paginationData={paginationData}
              onPageChange={getCurrentPageNumber}
              enablePagination={true}
              isLoading={isLoading}
            />
          </motion.div>
          {deleteFile && selectedFile && (
            <DeleteFileModal
              isOpen={deleteFile}
              onClose={handleCloseDeleteModal}
              shouldCloseOnOverlayClick={true}
              file={selectedFile}
              fileName={ROUTE_PRE_DRAFTS}
            />
          )}
        </section>
      )}
    </AnimatePresence>
  );
};

export default DraftFileView;
