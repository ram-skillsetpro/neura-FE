import DeleteFileModal from "core/components/modals/delete-file-modal/delete-file-modal";
import { useAppDispatch, useAppSelector } from "core/hook";
import { Toaster } from "core/models/toaster.model";
import {
  encodeFilePreContractKey,
  getFileIcon,
  getShortUsername,
  getUsernameColor,
} from "core/utils";
import { formatDateWithOrdinal, sharedUsersCount } from "core/utils/constant";
import { useAuthorityCheck } from "core/utils/use-authority-check.hook";
import useLocalStorage from "core/utils/use-local-storage";
import { AnimatePresence, motion } from "framer-motion";
import { AuthResponse } from "pages/auth/auth.model";
import { UploadedSignedContractType } from "pages/pre-dashboard/drafts/drafts.model";
import {
  deleteUploadAndSignDraft,
  getUploadedSignedContracts,
} from "pages/pre-dashboard/drafts/drafts.redux";
import { StateValue, getStateString } from "pages/user-dashboard/common-utility/utility-function";
import "pages/user-dashboard/components/my-files/other-files-view.scss";
import "pages/user-dashboard/components/my-files/recent-files-view.scss";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PRE_DRAFTS, TOAST, USER_AUTHORITY } from "src/const";
import DataTable from "src/layouts/admin/components/data-table/data-table";
interface IUploadedSignedContracts {}

export const UploadedSignedContracts: React.FC<IUploadedSignedContracts> = () => {
  const roleSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);
  const [auth] = useLocalStorage<AuthResponse>("auth");
  const navigate = useNavigate();
  const uploadedSignedContractList = useAppSelector(
    (state) => state.drafts?.uploadedSignedContractList,
  );
  const [activeFileOption, setActiveFileOption] = useState(-1);
  const [deleteFile, setDeleteFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedSignedContractType>();
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<Array<any>>([]);
  const [newFile] = useState<Array<number>>([]);
  const uploadedSignedContractResp = useAppSelector(
    (state) => state.drafts?.uploadedSignedContractResp,
  );
  const isLoading = useAppSelector((state) => state.drafts.isLoadingUploadedSignedContract);

  const [paginationData, setPaginationData] = useState({
    totalItems: uploadedSignedContractResp.totct as number,
    currentPage: 1,
    itemsPerPage: uploadedSignedContractResp.perpg,
  });

  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      const itemIds = rows.map((item) => item.id);
      setSelectedItems(itemIds);
    }
    setSelectAll((prevSelectAll) => !prevSelectAll);
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
      key: "contractName",
      label: "Name",
      isSorting: false,
    },
    { key: "state", label: "Stage", isSorting: false },
    { key: "createdOn", label: "Last Modified", isSorting: false },
    { key: "owner", label: "Owner", isSorting: false },
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
  const totalCount = uploadedSignedContractResp.totct as number;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  const getCurrentPageNumber = async (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      // const folder = getLastArrayFromLocalStorage(LS_DRAFT_FOLDERS_ROUTE);
      await dispatch(getUploadedSignedContracts({ pgn: newPage }));
    }
  };

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: uploadedSignedContractResp.totct as number,
      itemsPerPage: uploadedSignedContractResp.perpg,
    });
  }, [uploadedSignedContractResp]);

  useEffect(() => {
    if (newFile) {
      localStorage.removeItem("processStatusNew");
    }
  }, []);

  useEffect(() => {
    setRows(uploadedSignedContractList?.map((data) => dataGenerator(data)));
  }, [uploadedSignedContractList, activeFileOption, selectedItems, newFile]);

  const openFile = (file: UploadedSignedContractType) => {
    const flag = true;
    if (!file.id) {
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
      const encodedString = encodeFilePreContractKey({ contractId: file.id });
      navigate("/admin/upload-and-sign?key=" + encodedString, { replace: true });
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

  const handleDeleteFile = async (data: UploadedSignedContractType) => {
    const draftId = data?.id;
    await dispatch(deleteUploadAndSignDraft(draftId));
  };

  const handleCloseDeleteModal = async () => {
    setDeleteFile(false);
    setSelectedFile(undefined);
  };

  const dataGenerator = (data: UploadedSignedContractType) => {
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
      contractName: (
        <div
          className="file-list-name fs12 flex items-center"
          onClick={() => openFile({ ...data })}
        >
          <i className={`w-20 h-20 mr-2`}>
            <img
              src={require(
                `assets/images/icon-${getFileIcon(data.contractName, data.mimeType)}.svg`,
              )}
            />
          </i>
          <div
            className="flex items-center file-title-table inline-block overflow-hidden truncate-line1 lh1 rounded-6"
            data-fulltext={data.contractName}
          >
            {data.contractName}
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
      owner: (
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
            onClick={(e) => handleFileOption(e, data.id)}
          ></button>
          {activeFileOption === data.id && (
            <div className="dropdown-container">
              <div className="dropdown-box">
                <ul>
                  <li className="border-bottom" onClick={() => openFile({ ...data })}>
                    Open
                  </li>
                  {auth.profileId !== data.createdBy || data.state === 6 ? (
                    <li className={`border-bottom disabled`}>Delete</li>
                  ) : (
                    <li className="border-bottom" onClick={() => handleDeleteFile(data)}>
                      Delete
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
    <>
      <AnimatePresence mode="wait">
        {rows.length > 0 && (
          <section className="mb-5">
            <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
              MY UPLOAD & SIGN CONTRACTS
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
          </section>
        )}
      </AnimatePresence>
      {deleteFile && selectedFile && (
        <DeleteFileModal
          isOpen={deleteFile}
          onClose={handleCloseDeleteModal}
          shouldCloseOnOverlayClick={true}
          file={selectedFile}
          fileName={ROUTE_PRE_DRAFTS}
        />
      )}
    </>
  );
};
