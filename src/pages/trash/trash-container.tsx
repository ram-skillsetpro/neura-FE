import { useAuthorityCheck } from "core/utils/use-authority-check.hook";
import "pages/contract-data-list/contract-data-list.styles.scss";
import TrashFilesView from "pages/trash/components/my-files/trash-files";
import TrashPlaybookView from "pages/trash/components/my-files/trash-playbook-listing";
import TrashFolders from "pages/trash/components/my-folders/trash-folders";
import {
  clearReduxForTrashFiles,
  fetchTrashPlayBookListing,
  foldersPerPageFetched,
  getTrashFilePerPage,
  getTrashFoldersPerPage,
  trashReducer,
} from "pages/trash/trash.redux";
import React, { useEffect } from "react";
import { USER_AUTHORITY } from "src/const";
import NoDataPage from "src/core/components/no-data/no-data";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import DeletedTeamList from "../manage-team/deleted-teams/deleted-teams-list";
import { teamReducer } from "../manage-team/team.redux";
import { draftReducer } from "../pre-dashboard/drafts/drafts.redux";
import TrashDraftFileView from "../pre-dashboard/drafts/trash-draft-component";
import TrashUploadSignFileView from "../pre-dashboard/drafts/trash-upload-sign-component";
import TemplateTrashListView from "../pre-dashboard/templates/components/template-trash-list";
import { TemplatesReducer } from "../pre-dashboard/templates/templates.redux";
import "./trash-container.scss";

interface TrashFileContainer {}

const TrashFileContainer: React.FC<TrashFileContainer> = () => {
  const isContractCreator = useAuthorityCheck([USER_AUTHORITY.ROLE_PRE_CONTRACT_CREATOR]);
  const dispatch = useAppDispatch();

  const { deletedTeamList } = useAppSelector((state) => state.team);
  const { fileList, filesResponse, folderList } = useAppSelector((state) => state.trash);
  const { trashDraftList, trashUploadAndSignList } = useAppSelector((state) => state.drafts);
  const { trashTemplateList } = useAppSelector((state) => state.templates);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getTrashFilePerPage(1));
      await dispatch(getTrashFoldersPerPage(1));
      await dispatch(fetchTrashPlayBookListing(1));
    };
    fetchData();

    return () => {
      dispatch(clearReduxForTrashFiles());
      dispatch(foldersPerPageFetched([]));
    };
  }, []);

  return (
    <>
      <div className="left-section left-divider-sec">
        <div className="left-section-inner">
          <TrashPlaybookView />
          <TrashFilesView />
          <TrashFolders />
          <DeletedTeamList />
          {isContractCreator && (
            <>
              <TrashDraftFileView />
              <TrashUploadSignFileView />
              <TemplateTrashListView />
            </>
          )}
          {filesResponse.isLoading === false &&
          !Array.from(trashDraftList || []).length &&
          !Array.from(trashTemplateList || []).length &&
          !Array.from(deletedTeamList || []).length &&
          !Array.from(folderList || []).length &&
          !Array.from(trashUploadAndSignList || []).length &&
          !Array.from(fileList || []).length ? (
            <NoDataPage pathname={location.pathname} />
          ) : (
            ""
          )}
        </div>
      </div>
      {/* <div className="right-section">
        <NotificationStack />
      </div> */}
    </>
  );
};

export default TrashFileContainer;

export const reducer = {
  trash: trashReducer,
  team: teamReducer,
  drafts: draftReducer,
  templates: TemplatesReducer,
};
