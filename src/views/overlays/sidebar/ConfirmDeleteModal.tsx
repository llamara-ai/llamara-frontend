import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onAbort: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  onAbort,
}: Readonly<ConfirmDeleteModalProps>) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("sidebar.deleteUserData.confirmDialogTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("sidebar.deleteUserData.confirmDialogDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onAbort}>
            {t("sidebar.deleteUserData.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-700">
            {t("sidebar.deleteUserData.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
