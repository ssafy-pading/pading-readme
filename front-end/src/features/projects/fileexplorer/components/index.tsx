import { useRef, useState } from 'react';
import WebSocketComponent from "../model/WebSocketComponent";
import './index.css'; // scroll bar css
import { RefreshWebSocket } from '../type/directoryTypes';
import { IoReloadSharp } from "react-icons/io5";

function FileExplorer() {
    const [isRotating, setIsRotating] = useState(false);
    const refreshRef = useRef<RefreshWebSocket>(null);

    const handleRefreshButton = () => {
        setIsRotating(true);
        setTimeout(() => setIsRotating(false), 700);
        if (refreshRef.current) {
          refreshRef.current.refreshWebSocket();
        }
      };

    return (
        <div className="folderContainerBody h-full flex flex-col text-white"
            onContextMenu={(e) => {e.preventDefault();}}
        >
            <div className="flex justify-between items-center h-[25px] w-full border-b border-[#666871] border-opacity-50 bg-[#404040] font-medium">
                <p className="ml-3 text-xs font-bold text-c">Explorer</p>
                <button 
                    onClick={handleRefreshButton} 
                    className={`mr-3 ${isRotating ? "animate-spin-custom" : ""}`}
                >
                    <IoReloadSharp size={14}/>
                </button>
            </div>
            <div className="folder-container flex flex-1 w-full overflow-auto scroll">
                <WebSocketComponent ref={refreshRef} />
            </div>
        </div>
    );
}

export default FileExplorer;
