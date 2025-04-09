import { useState, useCallback, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t } from "i18next";
import { useGetKnowledgeList } from "@/services/GetKnowledgeListService";
import useKnowledgePermissionApi from "@/hooks/api/useKnowledgePermissionApi";
import { KnowledgeRecord } from "@/api";
import { useUserContext } from "@/services/UserContextService";
import { compareWithAnyPermission, USER_ANY } from "../KnowledgePermissions";

export type Permission = "OWNER" | "READWRITE" | "READONLY" | "NONE";

interface PermissionsDialogProps {
  knowledgeId: string | null;
  onClose: () => void;
}

export default function PermissionsDialog({
  knowledgeId,
  onClose,
}: Readonly<PermissionsDialogProps>) {
  const [permissions, setPermissions] = useState<Record<string, Permission>>(
    {},
  );
  const [newUsername, setNewUsername] = useState<string | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeRecord | null>(null);
  const [newPermission, setNewPermission] = useState<Permission | "">("");
  const [highestUserPermission, setHighestUserPermission] =
    useState<Permission>("NONE");

  const { updateKnowledgePermissions } = useKnowledgePermissionApi({
    knowledge,
  });
  const { user } = useUserContext();

  const { allKnowledge } = useGetKnowledgeList();

  useEffect(() => {
    if (knowledgeId) {
      const knowledge = allKnowledge.find((k) => k.id === knowledgeId);
      setKnowledge(knowledge ?? null);

      setPermissions(knowledge?.permissions ?? {});

      setHighestUserPermission(
        knowledge?.permissions
          ? compareWithAnyPermission(
              knowledge.permissions,
              user?.username ?? "",
            )
          : "NONE",
      );
    }
  }, [allKnowledge, knowledgeId]);

  useEffect(() => {
    if (knowledgeId) {
      const knowledge = allKnowledge.find((k) => k.id === knowledgeId);

      setPermissions(knowledge?.permissions ?? {});
    }
  }, [allKnowledge, knowledgeId]);

  const handlePermissionChange = useCallback(
    (username: string, permission: Permission) => {
      setPermissions((prev) => ({ ...prev, [username]: permission }));
    },
    [],
  );

  const handleRemovePermission = useCallback((username: string) => {
    setPermissions((prev) => {
      const newPermissions = { ...prev };
      if (newPermissions.hasOwnProperty(username))
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete newPermissions[username];
      return newPermissions;
    });
  }, []);

  const handleAddPermission = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (newUsername && !permissions[newUsername] && newPermission) {
      setPermissions((prev) => ({ ...prev, [newUsername]: newPermission }));
      setNewUsername(null);
      setNewPermission("");
    }
  }, [newUsername, permissions, newPermission]);

  const handleSubmit = async () => {
    onClose();
    await updateKnowledgePermissions(permissions);
    setNewPermission("");
    setNewUsername(null);
  };

  return (
    <Dialog open={knowledgeId !== null} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[600px] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {t("knowledgePage.permissionsDialog.title")}
          </DialogTitle>
          <DialogDescription>
            {t("knowledgePage.permissionsDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center mb-2 justify-centers">
            <Input
              placeholder={t(
                "knowledgePage.permissionsDialog.usernamePlaceholder",
              )}
              value={newUsername ?? ""}
              onChange={(e) => {
                setNewUsername(e.target.value);
              }}
            />
            <Select
              onValueChange={(value: Permission) => {
                setNewPermission(value);
              }}
              value={newPermission}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t(
                    "knowledgePage.permissionsDialog.selectPermission",
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="READWRITE">
                  {t("knowledgePage.table.permission.readwrite")}
                </SelectItem>
                <SelectItem value="READONLY">
                  {t("knowledgePage.table.permission.readonly")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddPermission}
              disabled={newPermission === "" || newUsername === null}
              size="icon"
              variant="ghost"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <hr />
          {Object.entries(permissions)
            .filter((p) => p[0] != USER_ANY)
            .map(([username, permission]) => (
              <div // permission entry for specific user
                key={username}
                className="grid grid-cols-[1fr_auto_auto] gap-2 items-center"
              >
                <span className="ml-2 w-3/4">{username}</span>
                <Select
                  disabled={
                    username === user?.username || permission === "OWNER"
                  }
                  defaultValue={permission}
                  onValueChange={(value: Permission) => {
                    handlePermissionChange(username, value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {permission === "OWNER" && (
                      <SelectItem value="OWNER" disabled={true}>
                        {t("knowledgePage.table.permission.owner")}
                      </SelectItem>
                    )}
                    <SelectItem value="READWRITE">
                      {t("knowledgePage.table.permission.readwrite")}
                    </SelectItem>
                    <SelectItem value="READONLY">
                      {t("knowledgePage.table.permission.readonly")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    handleRemovePermission(username);
                  }}
                  disabled={permission === "OWNER"}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          <div // permission entry for any user
            key="any"
            className="grid grid-cols-[1fr_auto_auto] gap-2 items-center"
          >
            <span className="ml-2 w-3/4">{t("user.any")}</span>
            <Select
              defaultValue={permissions[USER_ANY] ?? "NONE"}
              onValueChange={(value: Permission) => {
                if (value === "NONE") {
                  handleRemovePermission(USER_ANY);
                  return;
                }
                handlePermissionChange(USER_ANY, value);
              }}
              disabled={
                highestUserPermission === "READONLY" ||
                highestUserPermission === "NONE"
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="READONLY">
                  {t("knowledgePage.table.permission.readonly")}
                </SelectItem>
                <SelectItem value="NONE">
                  {t("knowledgePage.table.permission.none")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" disabled={true}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              void handleSubmit();
            }}
          >
            {t("knowledgePage.permissionsDialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
