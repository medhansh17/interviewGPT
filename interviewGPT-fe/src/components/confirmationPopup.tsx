import React from "react";
import { confirmDialog } from "primereact/confirmdialog";
import { Button } from "primereact/button";

interface ConfirmButtonProps {
  label: string;
  icon?: string;
  message: string;
  header: string;
  acceptClassName?: string;
  rejectClassName?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  onConfirm: () => void;
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  label,
  icon,
  message,
  header,
  acceptClassName,
  rejectClassName,
  acceptLabel = "Yes",
  rejectLabel = "No",
  onConfirm,
}) => {
  const handleAccept = () => {
    onConfirm();
  };

  const handleReject = () => {
    console.log("Action rejected");
  };

  const showConfirmDialog = () => {
    confirmDialog({
      message: <div className="text-gray-700">{message}</div>,
      header: (
        <div className="font-bold text-lg text-gray-800 mb-3">{header}</div>
      ),
      icon: <i className={`${icon || "pi pi-info-circle"} text-blue-500`} />,
      acceptClassName: `${
        acceptClassName || ""
      } bg-red-500 text-white hover:bg-blue-600 py-2 px-3 rounded-lg text-md mt-3 flex-end`,
      rejectClassName: `${rejectClassName || ""} text-blue-500 py-2 px-4 mt-3`,
      position: "center",
      accept: handleAccept,
      reject: handleReject,
      acceptLabel,
      rejectLabel,
      className: "p-4 bg-white rounded-lg shadow-lg flex flex-col items-end",
    });
  };

  return (
    <Button
      onClick={showConfirmDialog}
      icon={icon}
      label={label}
      className="cursor-pointer resp-btn bg-red-200 text-red-600"
    />
  );
};

export default ConfirmButton;
