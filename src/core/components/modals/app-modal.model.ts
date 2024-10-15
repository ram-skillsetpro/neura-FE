export interface AppModalType {
  isOpen: boolean;
  onClose?: () => void;
  onAfterOpen?: () => void;
  children?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  shouldCloseOnOverlayClick?: boolean;
  onAfterClose?: () => void;
}
