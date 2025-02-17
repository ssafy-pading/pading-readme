import WebSocketComponent from "../model/WebSocketComponent";
import '../widgets/Folder.css';

function FileExplorer() {

    return (
        <div className="folderContainerBody h-full flex flex-col text-white"
            onContextMenu={
                (e) => {
                    e.preventDefault();
                }
            }
        >
            <div className="flex items-center h-[25px] w-full border-b border-[#666871] border-opacity-50 bg-[#2F3336] font-medium">
                <p className="ml-3 text-xs font-bold text-c">Explorer</p>
            </div>
            <div className="folder-container flex flex-1 w-full overflow-auto scroll">
                <WebSocketComponent />
            </div>
        </div>
    );
}

export default FileExplorer;
