import { loginSuccess, validateResetPasswordToken } from "examples/auth/auth.redux";
import { setUserProfileLogo, validateUserToken } from "pages/auth/auth.redux";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Route, Routes } from "react-router-dom";
import { CsrHead } from "src/core/components/csr-head/csr-head.comp";
import { ROUTE_404 } from "./const";
import LazyRoute from "./core/components/lazy-route/lazy-route.component";
import { Loader } from "./core/components/loader/loader.comp";
import AllFilesViewerComponent from "./core/components/modals/all-files-viewer/all-files-viewer-modal";
import { Toaster } from "./core/components/toaster/toaster.comp";
import { getAccessToken } from "./core/functions/get-token";
import { migrateToNewToken } from "./core/functions/migrate-to-new-token";
import { useAppDispatch, useAppSelector } from "./core/hook";
import { CommonService } from "./core/services/common.service";
import { HttpClient } from "./core/services/http-client";
import { encodeFileKey, encodeFilePreContractKey, getAuth, openFile } from "./core/utils";
import { handleFileToOpen } from "./pages/contract/contract.redux";
import { FileToOpenType } from "./pages/pre-dashboard/dashboard.model";
import { Routes as PageRoutes } from "./routes";
const preventDefaultForDocument = (e: DragEvent) => {
  e.preventDefault();
};

const preventDefaultForDrop = (e: DragEvent) => {
  e.preventDefault();
};

document.addEventListener("dragover", preventDefaultForDocument);
document.addEventListener("drop", preventDefaultForDrop);

migrateToNewToken();

export function App(props: AppProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [openAllFileModal, setOpenAllFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileToOpenType>();

  const contractState = useAppSelector((state) => state.contract);
  const dataFilter = useAppSelector((state) => state.dataFilter) || {};

  useEffect(() => {
    const { fileToOpen } = contractState || {};
    const { selectedFilterContractType, selectedFilterUsers, selectedDateRangeFilter } =
      dataFilter || {};
    if (fileToOpen) {
      const {
        id,
        folderId,
        teamId,
        status,
        mimeType,
        fileName,
        createdBy,
        trackingId,
        source,
        other,
        routeDataMap,
      } = fileToOpen || {};
      dispatch(handleFileToOpen(null));
      if (trackingId) {
        setSelectedFile({ id, teamId, mimeType, fileName, trackingId });
        setOpenAllFileModal(true);
        return;
      }
      if (mimeType === "application/pdf") {
        const { fromDate = undefined, toDate = undefined } = selectedDateRangeFilter || {};
        const localData = {
          contractTypeId: Array.from(selectedFilterContractType || []).length
            ? selectedFilterContractType.map((obj) => obj.id).join(",")
            : undefined,
          teamUserId: Array.from(selectedFilterUsers || []).length
            ? selectedFilterUsers.map((obj) => obj.id).join(",")
            : undefined,
          fromDate,
          toDate,
        };
        openFile(
          {
            other: { ...localData, ...other },
            id,
            folderId,
            teamId,
            status,
            mimeType,
            fileName,
            createdBy,
            source,
            routeDataMap,
          },
          navigate,
        );
        return;
      }
      setSelectedFile({ id, folderId, teamId, status, mimeType, fileName });
      setOpenAllFileModal(true);
    }
  }, [contractState]);

  HttpClient.onResponse = (apiResponse, options) => {
    if (!apiResponse.isSuccess) {
      if (apiResponse.status === 400 || apiResponse.status > 1000) {
        if (apiResponse.message.length && options.showNotificationMessage) {
          apiResponse.message[0] &&
            CommonService.popupToast({
              type: "error",
              message: apiResponse.message[0],
            });
        }
      } else if (apiResponse.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.assign("/?action=login");
        // dispatch(redirectTo({ path: ROUTE_LOGIN }));
      } else if (apiResponse.status === 403) {
        // dispatch(redirectTo({ path: ROUTE_404 }));
        console.log("403:UnAuthorized Request");
      }
    }
  };

  // useEffect(() => {
  //   if (appRedirectTo) {
  //     navigate(appRedirectTo.path, appRedirectTo.options);
  //   }
  // }, [appRedirectTo]);

  const urlSearchParams: any = new URLSearchParams(window.location.search);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const token = urlSearchParams.get("t");
    const contractId = urlSearchParams.get("contractId");

    if (urlSearchParams.has("action") && urlSearchParams.get("action") === "pre-contract") {
      localStorage.clear();
      const validate = async () => {
        const isValidate = await dispatch(validateUserToken(token ?? ""));
        if (isValidate) {
          const encodedString = encodeFilePreContractKey({ contractId });
          navigate("/admin/pre-contract?key=" + encodedString);
        }
      };
      validate();
      return;
    }

    if (urlSearchParams.has("action") && urlSearchParams.get("action") === "open-contract") {
      const id = urlSearchParams.get("id");
      const teamId = urlSearchParams.get("teamId");
      const folderId = urlSearchParams.get("folderId");
      const fileName = urlSearchParams.get("fileName");

      localStorage.clear();
      const validate = async () => {
        const isValidate = await dispatch(validateUserToken(token ?? ""));
        if (isValidate) {
          const encodedString = encodeFileKey({ id, teamId, folderId, fileName });
          navigate("/admin/file?key=" + encodedString);
        }
      };
      validate();
      return;
    }

    if (urlSearchParams.has("action") && urlSearchParams.get("action") === "upload-sign") {
      const contractId = urlSearchParams.get("contractId");

      localStorage.clear();
      const validate = async () => {
        const isValidate = await dispatch(validateUserToken(token ?? ""));
        if (isValidate) {
          const encodedString = encodeFilePreContractKey({ contractId });
          navigate("/admin/upload-and-sign?key=" + encodedString, { replace: true });
        }
      };
      validate();
      return;
    }

    if (
      urlSearchParams.has("action") &&
      ["view-redact", "view-snippet"].includes(urlSearchParams.get("action") || "")
    ) {
      const validate = async () => {
        if (token) {
          const action = urlSearchParams.get("action");
          navigate("/view-excerpt", { state: { token, action }, replace: true });
        }
      };
      validate();
      return;
    }

    if (
      urlSearchParams.has("action") &&
      ["view-extshare"].includes(urlSearchParams.get("action") || "")
    ) {
      const validate = async () => {
        if (token) {
          const action = urlSearchParams.get("action");
          navigate("/view-shared-contract", { state: { token, action }, replace: true });
        }
      };
      validate();
      return;
    }

    // if (urlSearchParams.has("action") && urlSearchParams.get("action") === "reset-password") {
    if (token) {
      localStorage.clear();
      const validateResetPass = async () => {
        const data = await dispatch(validateResetPasswordToken(token ?? ""));
        if (data?.isSuccess) {
          navigate(`/change-password?t=${token}`);
        }
      };
      validateResetPass();
    }
    // }

    const auth = getAuth();
    if (getAccessToken()) {
      dispatch(loginSuccess({ isLoggedIn: true }));
    }

    // if (getAccessToken() && auth?.ev === false) {
    //   localStorage.clear();
    //   sessionStorage.clear();
    //   window.location.assign("/?action=login");
    // }

    dispatch(setUserProfileLogo(auth.userLogo));
  }, []);

  return (
    <>
      {/* Use SsrHead component to set common Head tags */}
      {[
        "pre-contract",
        "upload-sign",
        "open-contract",
        "view-snippet",
        "view-redact",
        "view-shared-contract",
      ].includes(urlSearchParams?.get("action")) ? (
        <Loader />
      ) : (
        <>
          <CsrHead />
          <div className="app-bg">
            <Routes>
              {PageRoutes.map((r, idx) => {
                if (r.children) {
                  return (
                    <Route
                      path={r.path}
                      element={<LazyRoute moduleProvider={r.component} route={r} {...props} />}
                      key={idx}
                    >
                      {r.children.map((child) => {
                        return (
                          <Route
                            path={child.path}
                            element={
                              <LazyRoute
                                moduleProvider={child.component}
                                route={child}
                                {...props}
                              />
                            }
                            key={idx}
                          />
                        );
                      })}
                    </Route>
                  );
                }
                return (
                  <Route
                    path={r.path}
                    element={<LazyRoute moduleProvider={r.component} route={r} {...props} />}
                    key={idx}
                  />
                );
              })}
              <Route path="*" element={<Navigate to={ROUTE_404} />} />
            </Routes>
          </div>
        </>
      )}

      <Toaster />

      {openAllFileModal && (
        <AllFilesViewerComponent
          isOpen={openAllFileModal}
          onClose={() => setOpenAllFileModal(false)}
          shouldCloseOnOverlayClick={true}
          data={selectedFile}
        />
      )}
    </>
  );
}

export interface AppProps {
  pageProps?: any;
}
