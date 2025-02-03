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
      className="context-menu bg-slate-600 text-white"
      style={{
        position: 'fixed',
        left: globalContextMenu.x,
        top: globalContextMenu.y,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        borderRadius: '6px',
        zIndex: 1000,
        minWidth: '160px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {explorerData.type === "FOLDER" ? (
        <>
          <div className="menu-item" 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteNode(explorerData.id);
              closeGlobalContextMenu();
            }}>
            <VscTrash className="menu-icon" /> Delete
          </div>
          <div className="menu-item" onClick={() => {
            handleRenameStart();
            closeGlobalContextMenu();
          }}>
            <VscEdit className="menu-icon" /> Rename
          </div>
          <div className="menu-item" onClick={() => {
            handleNewItem("FOLDER");
            closeGlobalContextMenu();
          }}>
            <VscNewFolder className="menu-icon" /> New Folder
          </div>
          <div className="menu-item" onClick={() => {
            handleNewItem("FILE");
            closeGlobalContextMenu();
          }}>
            <VscNewFile className="menu-icon" /> New File
          </div>
        </>
      ) : (
        <>
          <div className="menu-item" onClick={() => {
            handleDeleteNode(explorerData.id);
            closeGlobalContextMenu();
          }}>
            <VscTrash className="menu-icon" /> Delete
          </div>
          <div className="menu-item" onClick={() => {
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
    <div onContextMenu={handleContextMenu} style={{ position: 'relative' }}>
      <div
        className="node-container"
        style={{
          cursor: 'pointer',
          backgroundColor: selectedId === explorerData.id ? 'rgba(59,130,246,0.1)' : 'transparent',
          border: selectedId === explorerData.id ? '2px solid #3B82F6' : 'none',
          padding: '4px 8px',
          borderRadius: '4px',
        }}
        onClick={handleNodeClick}
      >
        <div className="node-content">
          {explorerData.type === "FOLDER" && (
            <span className="chevron-icon">
              {expand ? <VscChevronDown /> : <VscChevronRight />}
            </span>
          )}
          <span className="file-icon">
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
              className="rename-input"
            />
          ) : (
            <span className="node-name">{explorerData.name}</span>
          )}
        </div>
      </div>
  
      {globalContextMenu.visible && globalContextMenu.nodeId === explorerData.id && renderContextMenu()}
  
      {explorerData.type === "FOLDER" && expand && (
        <div style={{ marginLeft: '24px' }}>
          {showInput.visible && (
            <div className="new-item-input">
              <span className="file-icon">
                {showInput.type === "FOLDER" ? <VscFolder /> : <VscFile />}
              </span>
              <input
                type="text"
                autoFocus
                onBlur={() => setShowInput({ visible: false, type: null })}
                onKeyDown={handleAdd}
                placeholder={`Enter ${showInput.type === "FOLDER" ? 'folder' : 'file'} name`}
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
