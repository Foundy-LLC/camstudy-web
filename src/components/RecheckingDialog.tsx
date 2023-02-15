import React from "react";

interface RecheckingDialogProps {
  title: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const RecheckingDialog: React.FC<RecheckingDialogProps> = ({
  title,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div>
      <p>{title}</p>
      <button onClick={onConfirm}>Yes</button>
      <button onClick={onCancel}>No</button>
    </div>
  );
};

export default RecheckingDialog;
