import userIcon from "assets/images/user.png";
import { getAuth, getShortUsername, getUsernameColor } from "core/utils";
import { UserProfileResponse } from "pages/admin-setting/setting.modal";
import React from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { CommonService } from "src/core/services/common.service";
import { fetchPreSignedUrl, uploadUserProfile } from "./settings-auth.redux";

interface IUserProfile {
  buttonAction: boolean;
  user?: Partial<UserProfileResponse>;
}

const UserProfile: React.FC<IUserProfile> = ({ buttonAction, user }) => {
  const dispatch = useAppDispatch();
  const auth = getAuth();

  const userLogo =
    useAppSelector((state) => state.auth.user?.userLogo) || auth.userLogo || userIcon;

  const handleFileSelect = async (e: any) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      CommonService.toast({
        type: "error",
        message: "Please select a file to upload.",
      });
      return;
    }

    const preSignedData = await dispatch(fetchPreSignedUrl());

    if (preSignedData.userLogoURL) {
      const presignedUrl = preSignedData.presignedUrl;
      dispatch(
        uploadUserProfile({
          file: selectedFile,
          url: presignedUrl,
          userLogo: preSignedData.userLogoURL,
        }),
      );
    }
  };

  return (
    <div className="user-img-sec">
      <div
        className="user-img user-settings-photo"
        style={{
          backgroundColor:
            (!user?.userLogoUrl && getUsernameColor(user?.userName as string)) || "initial",
        }}
      >
        {!buttonAction ? (
          user?.userLogoUrl ? (
            <img src={user?.userLogoUrl} />
          ) : (
            `${getShortUsername(user?.userName as string)}`
          )
        ) : user?.userLogoUrl ? (
          <>
            <img src={user?.userLogoUrl} />
          </>
        ) : (
          <div
            className="tool-tip-wrap w-full h-full flex items-center justify-center"
            style={{
              backgroundColor:
                (user?.userName as string) === ""
                  ? getUsernameColor(user?.userName as string) || ""
                  : "initial",
            }}
          >
            {getShortUsername(user?.userName as string)}
          </div>
        )}
      </div>
      {buttonAction && (
        <div className="user-upload-img">
          <input onChange={handleFileSelect} type="file" />
        </div>
      )}
    </div>
  );
};

export default UserProfile;
