import IconMoreHorizontalDark from "assets/images/icon-more-horizontal-dark.svg";
import { AnimatePresence, motion } from "framer-motion";
import { TeamListType } from "pages/manage-team/team.model";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_TEAM_FILES } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { LS_TEAM } from "src/core/utils/constant";
import useLocalStorage from "src/core/utils/use-local-storage";
import { isFolderExistOnSearch } from "src/pages/manage-team/team-files/team-files.redux";

interface FolderNavigationType {
  label?: string;
  handleGoBack: (id: number) => void;
  goBack: () => void;
}
const FolderNavigation = ({ label, handleGoBack, goBack }: FolderNavigationType) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [teamData] = useLocalStorage<TeamListType>(LS_TEAM);
  const SearchFolderParentExists = useAppSelector(
    (state) => state.teamDashboard?.SearchFolderParentExists,
  );
  const navValue = searchParams.get("folders");
  const keyValue = searchParams.get("key");

  const [routeData, setRouteData] = useState<any[]>([]);
  const routeLocationState = useMemo(
    () => location.state?.routeDataMap || {},
    [location.state?.routeDataMap],
  );

  useEffect(() => {
    if (navValue) {
      const jsonData = routeLocationState[navValue];
      if (jsonData) {
        setRouteData(jsonData.map((folder: any) => ({ ...folder, uuid: navValue })));
      }
    }
    return () => {
      setRouteData([]);
    };
  }, [navValue]);

  useEffect(() => {
    if (keyValue) {
      const lastKey = Object.keys(routeLocationState).pop();
      if (lastKey) {
        const jsonData = routeLocationState[lastKey];
        if (jsonData) {
          setRouteData(jsonData.map((folder: any) => ({ ...folder, uuid: lastKey })));
        }
      }
    }
  }, [keyValue, routeLocationState]);

  const goBackToMain = () => {
    dispatch(isFolderExistOnSearch(false));
    goBack();
  };

  const goBackToTeamsDrive = async () => {
    navigate(localStorage.getItem("previousPath") ?? ROUTE_TEAM_FILES);
  };

  return (
    <>
      <div className="page-breadcrum mb-3">
        <ul className="breadcrum-ul mr-0">
          <AnimatePresence mode="sync">
            {location.pathname.includes(ROUTE_TEAM_FILES) ? (
              <motion.li
                exit={{ opacity: 0, x: 100 }}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="list"
                key={"default"}
              >
                <a onClick={goBackToMain}>Team Drive</a>
              </motion.li>
            ) : (
              <motion.li
                exit={{ opacity: 0, x: 100 }}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="list"
                key={label}
              >
                <a onClick={goBackToMain}>{label}</a>
                {SearchFolderParentExists && (
                  <div className="relative flex items-center">
                    <button className="breadcrum-btn flex">
                      <img src={IconMoreHorizontalDark} />
                    </button>
                    <div className="menu-card rounded-6"></div>
                  </div>
                )}
              </motion.li>
            )}
            {location.pathname.includes(ROUTE_TEAM_FILES) ||
            localStorage.getItem("previousPath")?.includes(ROUTE_TEAM_FILES) ? (
              <>
                <motion.li
                  exit={{ opacity: 0, x: 100 }}
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="list"
                  key={teamData?.id}
                >
                  <a onClick={goBackToTeamsDrive}>
                    <div className="truncate-link tool-tip-text" data-fulltext={teamData?.teamName}>
                      {teamData?.teamName}
                    </div>
                  </a>
                </motion.li>
                {SearchFolderParentExists && (
                  <motion.li
                    exit={{ opacity: 0, x: 100 }}
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="list"
                  >
                    <div className="relative flex items-center">
                      <button className="breadcrum-btn flex">
                        <img src={IconMoreHorizontalDark} />
                      </button>
                      <div className="menu-card rounded-6"></div>
                    </div>
                  </motion.li>
                )}
              </>
            ) : null}

            {routeData?.length < 4
              ? routeData?.map((folder) => (
                  <motion.li
                    exit={{ opacity: 0, x: 100 }}
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="list"
                    key={folder.id}
                  >
                    <a onClick={() => handleGoBack(folder)}>
                      <div
                        className="truncate-link tool-tip-text"
                        data-fulltext={folder.folderName}
                      >
                        {folder.folderName}
                      </div>
                    </a>
                  </motion.li>
                ))
              : routeData?.slice(0, 1).map((folder) => (
                  <motion.li
                    exit={{ opacity: 0, x: 100 }}
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="list"
                    key={folder.id}
                  >
                    <a onClick={() => handleGoBack(folder)}>
                      <div
                        className="truncate-link tool-tip-text"
                        data-fulltext={folder.folderName}
                      >
                        {folder.folderName}
                      </div>
                    </a>
                  </motion.li>
                ))}

            {routeData?.length > 3 && (
              <>
                <li>
                  <div className="relative drop-down-modal flex items-center mr-3">
                    <button className="breadcrum-btn flex">
                      <img src={IconMoreHorizontalDark} />
                    </button>
                    <div className="menu-card rounded-6">
                      <ul>
                        {routeData?.slice(1, -2).map((folder) => (
                          <li key={folder.id} onClick={() => handleGoBack(folder)}>
                            <a className="forward-arrow">
                              <div
                                className="truncate-link tool-tip-text"
                                data-fulltext={folder.folderName}
                              >
                                {folder.folderName}
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
                {routeData?.slice(-2).map((folder) => (
                  <motion.li
                    exit={{ opacity: 0, x: 100 }}
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    key={folder.id}
                    onClick={() => handleGoBack(folder)}
                    className="list"
                  >
                    <a className="forward-arrow">
                      <div
                        className="truncate-link tool-tip-text"
                        data-fulltext={folder.folderName}
                      >
                        {folder.folderName}
                      </div>
                    </a>
                  </motion.li>
                ))}
              </>
            )}
          </AnimatePresence>
        </ul>
      </div>
    </>
  );
};

export default FolderNavigation;
