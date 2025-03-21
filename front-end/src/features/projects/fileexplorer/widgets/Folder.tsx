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
import { FileNode, FileType, Payload, PayloadAction } from "../type/directoryTypes";
import toast, { Toaster } from 'react-hot-toast';
import Modal from 'react-modal';

Modal.setAppElement('#root');
interface FolderProps {
  explorerData: FileNode;
  selectedId: number | null;
  sendActionRequest: (
    action: PayloadAction,
    payload: Payload,
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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

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
    setModalIsOpen(false);
    e.preventDefault();
    handleNodeSelect(explorerData.id);
    setModalPosition({ top: e.clientY, left: e.clientX });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleCreate = (type: FileType) => {
    setIsCreating(true);
    setCreateType(type);
    setCreateValue("");
  };

  const handleCreateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && createValue.trim()) {
      if (checkDuplicateName(getFullPath(), createValue.trim())) {
        toast.error("해당 이름의 파일 혹은 폴더가 이미 존재합니다.");
        return;
      }

      const payload:Payload = {
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
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && renameValue.trim()) {
      if (checkDuplicateName(explorerData.parent, renameValue.trim())) {
        toast.error("해당 이름의 파일 혹은 폴더가 이미 존재합니다.");
        return;
      }

      const payload:Payload  = {
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
    const payload: Payload  = {
      action: "DELETE",
      type: explorerData.type,
      path: explorerData.parent,
      name: explorerData.name,
    };
    sendActionRequest("DELETE", payload);
  };

  const getFileContent = () => {
    if(explorerData.type==="DIRECTORY") return;
    const payload: Payload = {
      action: "CONTENT",
      type: explorerData.type,
      path: explorerData.parent,
      name: explorerData.name,
    }
    sendActionRequest("CONTENT", payload);
  }

  return (
    <div>
      <Toaster />
      <div
        className={`flex items-center text-xs mt-0.5 hover:bg-gray-800 ${selectedId === explorerData.id ? "bg-[rgba(59,130,246,0.3)] border border-[#3B82F6]" : ""
          } ${explorerData.type==="FILE"?'ml-3':null}`}
        onClick={toggleExpand}
        onDoubleClick={getFileContent}
        onContextMenu={handleContextMenu}
      >
        {explorerData.type === "DIRECTORY" && (
          <span className="flex items-center">
            {expand ? <VscChevronDown /> : <VscChevronRight />}
          </span>
        )}
        <span className="flex items-center text-white ml-[3px]">
          {explorerData.type === "DIRECTORY" ? <VscFolder /> : <VscFile />}
        </span>

        {isRenaming ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={() => setIsRenaming(false)}
            autoFocus
            className="h-4 bg-gray-800 border rounded p-1 outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_1px_#3B82F6]"
          />
        ) : (
          <span className="select-none ml-[6px] overflow-hidden whitespace-nowrap text-ellipsis">{explorerData.name==="/"?"app":explorerData.name}</span>
        )}
      </div>

      {isCreating && (
        <div className="flex items-center gap-2 my-1 ml-4 text-xs">
          <span className="flex items-center text-white">
            {createType === 'DIRECTORY' ? <VscFolder /> : <VscFile />}
          </span>
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
            className="h-4 bg-gray-800 border rounded p-1 outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_1px_#3B82F6]"
          />
        </div>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: modalPosition.top,
            left: modalPosition.left,
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(0, 0)',
            backgroundColor: '#212426',
            border: '1px solid #2F3336',
            borderRadius: '4px',
            padding: '4px 0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            fontSize: '14px',
          },
          overlay: {
            backgroundColor: 'transparent'
          }
        }}
      >
        <div className="py-2">
          {explorerData.type === "DIRECTORY" && (
            <>
              <div className="flex items-center px-4 py-1 gap-3 cursor-pointer text-xs text-white hover:bg-[#3B82F6]" onClick={() => { handleCreate("DIRECTORY"); closeModal(); }}>
                <VscNewFolder className="w-4 h-4 text-white text-xs" />
                <span>New Folder</span>
              </div>
              <div className="flex items-center px-4 py-1 gap-3 cursor-pointer text-xs text-white hover:bg-[#3B82F6]" onClick={() => { handleCreate("FILE"); closeModal(); }}>
                <VscNewFile className="w-4 h-4 text-white text-xs" />
                <span>New File</span>
              </div>
            </>
          )}
          <div className="flex items-center px-4 py-1 gap-3 cursor-pointer text-xs text-white hover:bg-[#3B82F6]" onClick={() => { handleRenameStart(); closeModal(); }}>
            <VscEdit className="w-4 h-4 text-white text-xs" />
            <span>Rename</span>
          </div>
          <div className="flex items-center px-4 py-1 gap-3 cursor-pointer text-xs text-white hover:bg-[#3B82F6]" onClick={() => { handleDelete(); closeModal(); }}>
            <VscTrash className="w-4 h-4 text-white text-xs" />
            <span>Delete</span>
          </div>
        </div>
      </Modal>

      {expand && explorerData.children && (
        <div className='ml-4'>
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
