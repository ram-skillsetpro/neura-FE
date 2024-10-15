import UploadTemplate from "pages/template/right-section-template/upload-template";
import NotificationStack from "src/core/components/notification/notification-stack";
interface PreTemplateStageProps {
  createdBy?: number;
  isGlobalTemplate: string;
}

const PreTemplateStage: React.FC<PreTemplateStageProps> = ({ createdBy, isGlobalTemplate }) => {
  return (
    <div className="right-section">
      <div className="right-section-inner">
        <NotificationStack />
        <div className="right-content-sec c-padding">
          {" "}
          {!(isGlobalTemplate === "YES" && createdBy === 0) && <UploadTemplate />}
        </div>
      </div>
    </div>
  );
};

export default PreTemplateStage;
