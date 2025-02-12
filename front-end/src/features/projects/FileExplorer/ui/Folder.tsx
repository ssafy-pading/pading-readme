import { useState } from "react";
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
import { FileType, FileNode } from "../type/directoryTypes";

interface FolderProps {
  explorerData: FileNode;
  handleInsertNode: (parentId: number, name: string, type: FileType) => void;
  handleDeleteNode: (nodeId: number) => void;
  handleUpdateFolder: (nodeId: number, newName: string, type: FileType) => void;
  selectedId: number | null;
  handleNodeSelect: (nodeId: number) => void;
  handleGlobalContextMenu: (nodeId: number, x: number, y: number) => void;
  globalContextMenu: {
    visible: boolean;
    x: number;
    y: number;
    nodeId: number | null;
  };
  closeGlobalContextMenu: () => void;
}

interface ShowInputState {
  visible: boolean;
  type: FileType | null;
}

interface UpdateInputState {
  visible: boolean;
  type: FileType | null;
}

const Folder: React.FC<FolderProps> = ({
  handleInsertNode,
  handleDeleteNode,
  handleUpdateFolder,
  explorerData,
  selectedId,
  handleNodeSelect,
  handleGlobalContextMenu,
  globalContextMenu,
  closeGlobalContextMenu,
}) => {
  const [expand, setExpand] = useState<boolean>(false);
  const [nodeName, setNodeName] = useState<string>(explorerData?.name || "");
  const [showInput, setShowInput] = useState<ShowInputState>({ visible: false, type: null });
  const [updateInput, setUpdateInput] = useState<UpdateInputState>({ visible: false, type: null });
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0,
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleNodeSelect(explorerData.id);
    handleGlobalContextMenu(
      explorerData.id,
      Math.min(e.clientX, window.innerWidth - 180),
      Math.min(e.clientY, window.innerHeight - 200)
    );
  };

  const handleNewItem = (type: FileType) => {
    if (contextMenu.visible) return; 
    setExpand(true);
    setShowInput({ visible: true, type });
  };

  const handleRenameStart = () => {
    setUpdateInput({ visible: true, type: explorerData.type });
  };

  const isNameExists = (name: string) => {
    return explorerData.children?.some(child => child.name === name);
  };

  const handleAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value && showInput.type) {
      const newName = e.currentTarget.value.trim();
      if (isNameExists(newName)) {
        alert('A folder or file name is already exists');
        e.currentTarget.select();
        return;
      }
  
      handleInsertNode(explorerData.id, newName, showInput.type);
      setShowInput({ visible: false, type: null });
    }
  };

  const handleRename = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value && updateInput.type) {
      handleUpdateFolder(explorerData.id, e.currentTarget.value, updateInput.type);
      setUpdateInput({ visible: false, type: null });
    }
  };

  const handleNodeClick = () => {
    handleNodeSelect(explorerData.id);
    if (explorerData.type === "FOLDER") setExpand(prev => !prev);
  };

  const renderContextMenu = () => (
    <div
      className="context-menu flex flex-1 bg-[#212426] border border-[#666871] border-opacity-50 p-1 text-white fixed shadow-md rounded-lg z-[1000] min-w-[160px]"
      style={{
        left: globalContextMenu.x,
        top: globalContextMenu.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {explorerData.type === "FOLDER" ? (
        <div className="flex-col gap-1">
          <div className="menu-item text-xs flex flex-row items-center gap-2 px-2 py-1 hover:bg-[#3B82F6] rounded-md" 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteNode(explorerData.id);
              closeGlobalContextMenu();
            }}>
            <VscTrash className="menu-icon" /> Delete
          </div>
          <div className="menu-item text-xs flex flex-row items-center gap-2 px-2 py-1 hover:bg-[#3B82F6] rounded-md" onClick={() => {
            handleRenameStart();
            closeGlobalContextMenu();
          }}>
            <VscEdit className="menu-icon" /> Rename
          </div>
          <div className="menu-item text-xs flex flex-row items-center gap-2 px-2 py-1 hover:bg-[#3B82F6] rounded-md" onClick={() => {
            handleNewItem("FOLDER");
            closeGlobalContextMenu();
          }}>
            <VscNewFolder className="menu-icon" /> New Folder
          </div>
          <div className="menu-item text-xs flex flex-row items-center gap-2 px-2 py-1 hover:bg-[#3B82F6] rounded-md" onClick={() => {
            handleNewItem("FILE");
            closeGlobalContextMenu();
          }}>
            <VscNewFile className="menu-icon" /> New File
          </div>
        </div>
      ) : (
        <>
          <div className="menu-item text-xs flex flex-row items-center gap-2 px-2 py-1 hover:bg-[#3B82F6] rounded-md" onClick={() => {
            handleDeleteNode(explorerData.id);
            closeGlobalContextMenu();
          }}>
            <VscTrash className="menu-icon" /> Delete
          </div>
          <div className="menu-item text-xs flex flex-row items-center gap-2 px-2 py-1 hover:bg-[#3B82F6] rounded-md" onClick={() => {
            handleRenameStart();
            closeGlobalContextMenu();
          }}>
            <VscEdit className="menu-icon" /> Rename
          </div>
        </>
      )}
    </div>
  );
  

  return (
    <div onContextMenu={handleContextMenu} className="relative flex-1 w-full overflow-auto">
      <div
        className={`node-container cursor-pointer mt-1 pl-2 w-full hover:bg-[#2F3336]
          ${selectedId === explorerData.id 
            ? "bg-[rgba(59,130,246,0.3)] border border-[#3B82F6] box-border" 
            : "bg-transparent border-none"
          }`}
        onClick={handleNodeClick}
      >
        <div className="node-content w-full flex items-center flex-nowrap">
          {explorerData.type === "FOLDER" && (
            <span className="chevron-icon text-xs">
              {expand ? <VscChevronDown /> : <VscChevronRight />}
            </span>
          )}
          <span className="file-icon text-xs ml-1">
            {explorerData.type === "FOLDER" ? <VscFolder /> : <VscFile />}
          </span>
          
          {updateInput.visible ? (
            <input
              type="text"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              autoFocus
              onBlur={() => setUpdateInput({ visible: false, type: null })}
              onKeyDown={handleRename}
              className="rename-input text-xs ml-2 bg-[#212426] border border-[#3B82F6] rounded-none"
            />
          ) : (
            <span className="node-name text-xs ml-1 truncate flex-1 min-w-0 overflow-hidden text-ellipsis">
              {explorerData.name}
            </span>
          )}
        </div>
      </div>
  
      {globalContextMenu.visible && globalContextMenu.nodeId === explorerData.id && renderContextMenu()}
  
      {explorerData.type === "FOLDER" && expand && (
        <div className="ml-6">
          {showInput.visible && (
            <div className="new-item-input text-xs flex flex-row items-center gap-1">
              <span className="file-icon">
                {showInput.type === "FOLDER" ? <VscFolder /> : <VscFile />}
              </span>
              <input
                type="text"
                autoFocus
                onBlur={() => setShowInput({ visible: false, type: null })}
                onKeyDown={handleAdd}
                placeholder={`Enter ${showInput.type === "FOLDER" ? 'folder' : 'file'} name`}
                className="bg-[#212426] text-xs border-[#3B82F6] rounded-none p-x-2"
              />
            </div>
          )}
          {explorerData.children?.map((child) => (
            <Folder
              key={child.id}
              explorerData={child}
              handleInsertNode={handleInsertNode}
              handleDeleteNode={handleDeleteNode}
              handleUpdateFolder={handleUpdateFolder}
              selectedId={selectedId}
              handleNodeSelect={handleNodeSelect}
              handleGlobalContextMenu={handleGlobalContextMenu}
              globalContextMenu={globalContextMenu}
              closeGlobalContextMenu={closeGlobalContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );  
};

export default Folder;
