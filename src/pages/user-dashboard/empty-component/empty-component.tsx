import { useAppSelector } from "core/hook";
import React from "react";

interface IEmptyComponent {
  text: string;
  messageOne?: string;
  messageTwo?: string;
}
export const EmptyComponent: React.FC<IEmptyComponent> = ({ text, messageOne, messageTwo }) => {
  const { sharedTeamList = [] } = useAppSelector((state) => state.team);
  return (
    <section className="mb-5">
      <div className="flex view-all-header mb-3">
        <h2 className="fs10 text-defaul-color font-normal tracking-wider uppercase ml-3">{text}</h2>
      </div>
      {sharedTeamList.length > 0 ? (
        <div className="upolad-empty rounded-6 w-full">
          <div className="upload-info font-bold">
            {/* {Your Drafts section are empty now} */}
            {messageOne}
            <br />
            {/* You can create new. */}
            {messageTwo}
          </div>
        </div>
      ) : (
        <div className="upolad-empty h-lg rounded-6 w-full">
          <div className="upload-info font-bold">
            {/* {Your Drafts section are empty now} */}
            {messageOne}
            <br />
            {/* You can create new. */}
            {messageTwo}
          </div>
        </div>
      )}
    </section>
  );
};
