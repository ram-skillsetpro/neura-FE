import useModal from "core/utils/use-modal.hook";
import { MembersType } from "pages/manage-members/manage-members.model";
import React from "react";
import { USER_AUTHORITY } from "src/const";
import { useAppDispatch } from "src/core/hook";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import { activateMember, getAllMembers } from "../manage-members.redux";
import Modal from "./modal/member-details-modal.component";

interface ManageMemberOptionType {
  member: MembersType;
  setMemberOption: React.Dispatch<React.SetStateAction<number>>;
  editMember: (member: MembersType) => void;
}

const ManageMemberOption: React.FC<ManageMemberOptionType> = ({
  member,
  setMemberOption,
  editMember,
}) => {
  const dispatch = useAppDispatch();
  const [isShowingModal, toggleModal] = useModal();

  const isSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);

  const handleToggleMember = async () => {
    try {
      const response = await dispatch(
        activateMember({ profileId: member?.id, status: member?.status === 0 ? 1 : 0 }),
      );
      if (response?.isSuccess) {
        await dispatch(getAllMembers());
      }
    } catch (error) {
      console.log(error);
    } finally {
      setMemberOption(-1);
    }
  };

  const handleEditMember = () => {
    setTimeout(() => {
      setMemberOption(-1);
    }, 10);
    editMember(member);
  };
  const closeMemberDetails = () => {
    toggleModal();
    setTimeout(() => {
      setMemberOption(-1);
    }, 10);
  };

  return (
    <div className="dropdown-list medium">
      <ul>
        <li>
          <a onClick={toggleModal}>View Member Details</a>
          <Modal show={isShowingModal} onCloseButtonClick={closeMemberDetails} member={member} />
        </li>
        {isSuperAdmin && (
          <>
            <li>
              <a onClick={handleEditMember}>Edit Member Details</a>
            </li>

            <li>
              <a onClick={handleToggleMember}>
                {member?.status ? "Deactivate" : "Activate"} Member
              </a>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default ManageMemberOption;
