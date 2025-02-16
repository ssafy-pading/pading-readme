import React, { useState, useEffect } from "react";
import {
  VscChevronRight,
  VscChevronDown,
  VscFolder,
  VscFile,
  VscNewFolder,
  VscNewFile,
  VscEdit,
  VscTrash,
} from "react-icons/vsc";
import { FileNode, FileType } from "../type/directoryTypes";

interface FolderProps {
  explorerData: FileNode;
  selectedId: number | null;
  sendActionRequest: (
    action: "LIST" | "CREATE" | "DELETE" | "RENAME",
    payload: any
  ) => void;
  handleNodeSelect: (nodeId: number) => void;
  checkDuplicateName: (path: string, name: string) => boolean;
}

const Folder: React.FC<FolderProps> = ({
  explorerData,
  selectedId,
  sendActionRequest,
  handleNodeSelect,
  checkDuplicateName,
}) => {
  const [expand, setExpand] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(explorerData.name);
  const [isCreating, setIsCreating] = useState(false);
  const [createType, setCreateType] = useState<FileType | null>(null);
  const [createValue, setCreateValue] = useState("");
  const [globalContextMenu, setGlobalContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    nodeId: number | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: null
  });

  useEffect(() => {
    const handleClickOutside = () => {
      if (globalContextMenu.visible) {
        setGlobalContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [globalContextMenu.visible]);

  const getFullPath = (): string => {
    if (explorerData.parent === "" || explorerData.parent === "/") {
      return explorerData.name === "/" ? "/" : `/${explorerData.name}`;
    }
    return `${explorerData.parent}/${explorerData.name}`;
  };

  const toggleExpand = () => {
    handleNodeSelect(explorerData.id);
    if (explorerData.type === "DIRECTORY") {
      const path = getFullPath();
      sendActionRequest("LIST", { path });
      setExpand((prev) => !prev);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGlobalContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      nodeId: explorerData.id
    });
    handleNodeSelect(explorerData.id);
  };

  const handleCreate = (type: FileType) => {
    setIsCreating(true);
    setCreateType(type);
    setCreateValue("");
    setGlobalContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleCreateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && createValue.trim()) {
      if (checkDuplicateName(getFullPath(), createValue.trim())) {
        alert("같은 이름이 이미 존재합니다.");
        return;
      }
  
      const payload = {
        action: "CREATE",
        type: createType,
        path: getFullPath(),
        name: createValue.trim(),
      };
      sendActionRequest("CREATE", payload);
      setIsCreating(false);
      setCreateType(null);
    }
  };

  const handleRenameStart = () => {
    setIsRenaming(true);
    setGlobalContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && renameValue.trim()) {
      if (checkDuplicateName(explorerData.parent, renameValue.trim())) {
        alert("같은 이름이 이미 존재합니다.");
        return;
      }
  
      const payload = {
        action: "RENAME",
        type: explorerData.type,
        path: explorerData.parent,
        oldName: explorerData.name,
        newName: renameValue.trim(),
      };
      sendActionRequest("RENAME", payload);
      setIsRenaming(false);
    }
  };

  const handleDelete = () => {
    const payload = {
      action: "DELETE",
      type: explorerData.type,
      path: explorerData.parent,
      name: explorerData.name,
    };
    sendActionRequest("DELETE", payload);
    setGlobalContextMenu(prev => ({ ...prev, visible: false }));
  };

  return (
    <div>
      <div className="flex items-center hover:bg-gray-800 cursor-pointer select-none" onClick={toggleExpand} onContextMenu={handleContextMenu}>
        {explorerData.type === "DIRECTORY" && (
          <span>{expand ? <VscChevronDown /> : <VscChevronRight />}</span>
        )}
        <span>{explorerData.type === "DIRECTORY" ? <VscFolder /> : <VscFile />}</span>
        {isRenaming ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={() => setIsRenaming(false)}
            autoFocus
            className="ml-2 text-xs bg-[#212426] border border-[#3B82F6] rounded-none"
          />
        ) : (
          <span className="ml-2 text-xs">{explorerData.name}</span>
        )}
      </div>

      {isCreating && (
        <div className="ml-8">
          <input
            type="text"
            value={createValue}
            onChange={(e) => setCreateValue(e.target.value)}
            onKeyDown={handleCreateKeyDown}
            onBlur={() => {
              setIsCreating(false);
              setCreateType(null);
            }}
            autoFocus
            placeholder={`Enter ${createType === 'DIRECTORY' ? 'folder' : 'file'} name`}
            className="ml-2 text-xs bg-[#212426] border border-[#3B82F6] rounded-none"
          />
        </div>
      )}

      {globalContextMenu.visible && globalContextMenu.nodeId === explorerData.id && (
        <div
          className="absolute bg-[#212426] border border-gray-700 py-2"
          style={{ top: globalContextMenu.y, left: globalContextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {explorerData.type === "DIRECTORY" && (
            <>
              <div className="px-4 py-1 hover:bg-gray-700 flex items-center gap-2" onClick={() => handleCreate("DIRECTORY")}>
                <VscNewFolder />
                <span>New Folder</span>
              </div>
              <div className="px-4 py-1 hover:bg-gray-700 flex items-center gap-2" onClick={() => handleCreate("FILE")}>
                <VscNewFile />
                <span>New File</span>
              </div>
            </>
          )}
          <div className="px-4 py-1 hover:bg-gray-700 flex items-center gap-2" onClick={handleRenameStart}>
            <VscEdit />
            <span>Rename</span>
          </div>
          <div className="px-4 py-1 hover:bg-gray-700 flex items-center gap-2" onClick={handleDelete}>
            <VscTrash />
            <span>Delete</span>
          </div>
        </div>
      )}

      {expand && explorerData.children && (
        <div className="ml-8">
          {explorerData.children.map((child) => (
            <Folder
              key={child.id}
              explorerData={child}
              selectedId={selectedId}
              sendActionRequest={sendActionRequest}
              handleNodeSelect={handleNodeSelect}
              checkDuplicateName={checkDuplicateName}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Folder;
