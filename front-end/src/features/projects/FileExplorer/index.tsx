import { useEffect, useState, useCallback } from "react";
import { dummyFileSystem } from "./api/folderData";
import Folder from "./ui/Folder";
import useTraverseTree from "./model/useTraverseTree";

import { FileType, FileNode } from "./type/directoryTypes";

function FileExplorer() {
    const [explorerData, setExplorerData] = useState<FileNode>(dummyFileSystem);
    const [selectedId, setSelectedId] = useState<number | null>(null); // 선택된 노드의 ID를 관리
    const { createNode, deleteNode, renameNode, sortNodes } = useTraverseTree();
    const [globalContextMenu, setGlobalContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        nodeId: number | null;
    }>({
        visible: false,
        x: 0,
        y: 0,
        nodeId: null,
    });

    useEffect(() => {
        setExplorerData(sortNodes(dummyFileSystem));
    }, []);

    const handleInsertNode = (id: number, name: string, type: FileType) => {
        const finalItem = createNode(explorerData, id, name, type);
        setExplorerData(sortNodes(finalItem));
    };
    const handleDeleteNode = (id: number) => {
        const finalItem = deleteNode(explorerData, id);
        setExplorerData(prev => finalItem ? sortNodes(finalItem) : prev);
    };

    const handleUpdateFolder = (id: number, updatedValue: string) => {
        const finalItem = renameNode(explorerData, id, updatedValue);
        setExplorerData(sortNodes(finalItem));
    };

    const handleNodeSelect = useCallback((id: number) => {
        setSelectedId(prev => prev === id ? null : id); // 토글 방식으로 변경
    }, []);

    const handleGlobalContextMenu = useCallback((nodeId: number, x: number, y: number) => {
        setGlobalContextMenu({ visible: true, x, y, nodeId });
    }, []);

    const closeGlobalContextMenu = useCallback(() => {
        setGlobalContextMenu(prev => ({ ...prev, visible: false, nodeId: null }));
    }, []);

    useEffect(() => {
        const handleClick = () => {
            closeGlobalContextMenu();
        };

        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, [closeGlobalContextMenu]);

    return (
        <div className="folderContainerBody"
            onContextMenu={
                (e) => {
                    e.preventDefault();
                }
            }
        >
            <div className="folder-container text-white w-full">
                <div className="h-[30px] w-full border-b-2 border-[#273654] bg-[#0F172A] font-medium">
                    Explorer
                </div>
                <Folder
                    handleInsertNode={handleInsertNode}
                    handleDeleteNode={handleDeleteNode}
                    handleUpdateFolder={handleUpdateFolder}
                    explorerData={explorerData}
                    selectedId={selectedId}
                    handleNodeSelect={handleNodeSelect}
                    handleGlobalContextMenu={handleGlobalContextMenu}
                    globalContextMenu={globalContextMenu}
                    closeGlobalContextMenu={closeGlobalContextMenu}
                />
            </div>
        </div>
    );
}

export default FileExplorer;
