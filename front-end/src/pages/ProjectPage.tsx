import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import ProjectEditor from "../widgets/projects/ProjectEditor";
import TerminalComponent from "../widgets/projects/ProjectTerminal";

const ProjectPage = () => {
  const [activeTopTab, setActiveTopTab] = useState("TERMINAL"); // 상단 탭
  const [terminals, setTerminals] = useState([<TerminalComponent key={0} />]); // 터미널
  const [activeTerminal, setActiveTerminal] = useState(0); // 활성화된 터미널
  const scrollRef = useRef<HTMLDivElement | null>(null); // 터미널 탭 스크롤 참조
  const isDragging = useRef(false); // 드래그 상태
  const startX = useRef(0); // 드래그 시작 위치

  const addNewTerminal = () => {
    setTerminals([...terminals, <TerminalComponent key={terminals.length} />]);
    setActiveTerminal(terminals.length);
  };

  const deleteTerminal = (index: number) => {
    if (terminals.length === 1) return;
    const updatedTerminals = terminals.filter((_, i) => i !== index);
    setTerminals(updatedTerminals);
    if (activeTerminal >= updatedTerminals.length) {
      setActiveTerminal(updatedTerminals.length - 1);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - startX.current;
    scrollRef.current.scrollLeft -= dx;
    startX.current = e.clientX;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 flex flex-col">
      {/* 상단 메뉴 */}
      <Link to="/">홈으로</Link>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() =>
            setActiveTopTab((prev) => (prev === "light" ? "dark" : "light"))
          }
          className="p-2 bg-blue-500 text-white rounded dark:bg-blue-700"
        >
          Toggle Dark Mode
        </button>
      </div>

      {/* 파일 탐색기 + 에디터 */}
      <div className="flex mt-4 h-[calc(100vh-200px)]">
        {/* 좌측 파일 탐색기 */}
        <div className="w-1/4 bg-gray-200 dark:bg-gray-700 p-4 overflow-y-auto">
          <h3 className="text-lg font-bold">Explorer</h3>
          <ul className="mt-4 space-y-2">
            <li className="text-blue-500 cursor-pointer">index.js</li>
            <li className="text-blue-500 cursor-pointer">App.js</li>
            <li className="text-blue-500 cursor-pointer">style.css</li>
          </ul>
        </div>

        {/* 우측 에디터 */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 pl-1 overflow-y-auto">
          <ProjectEditor />
        </div>
      </div>

      {/* 터미널 영역 */}
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 flex flex-col p-4 bg-gray-900 text-white rounded">
          {/* 상단 탭 */}
          <div className="flex bg-gray-800 px-4 py-2 items-center">
            <div className="flex space-x-4">
              {["TERMINAL", "OUTPUT", "DEBUG CONSOLE"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTopTab(tab)}
                  className={`px-4 py-2 text-sm rounded-md ${activeTopTab === tab
                    ? "bg-gray-700 text-white border-b-2 border-blue-500"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white transition"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* + 버튼 */}
            <div className="ml-auto">
              <button
                onClick={addNewTerminal}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                title="Add new terminal"
              >
                +
              </button>
            </div>
          </div>


          {/* 터미널 화면 및 탭 */}
          <div className="flex flex-grow">
            {/* 터미널 화면 */}
            <div className="flex-grow bg-black mt-2">
              {terminals[activeTerminal]}
            </div>

            {/* 터미널 탭 */}
            {terminals.length > 1 && ( // 터미널이 2개 이상일 때만 탭 리스트 표시
              <div
                // className="flex flex-col justify-between w-40 bg-gray-800 px-2 py-4"
                // ref={scrollRef}
                // onMouseDown={handleMouseDown}
                // onMouseMove={handleMouseMove}
                // onMouseUp={handleMouseUp}
                // onMouseLeave={handleMouseUp}
              >
                <div className="flex flex-col overflow-y-auto space-y-2 flex-1">
                  {terminals.map((_, index) => (
                    <div
                      key={index}
                      className={`flex items-center px-4 py-2 rounded-lg ${activeTerminal === index
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300"
                        } cursor-pointer`}
                      onClick={() => setActiveTerminal(index)}
                    >
                      Terminal {index + 1}
                      {terminals.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTerminal(index);
                          }}
                          className="ml-2 text-red-500 hover:text-red-400"
                        >
                          ✖
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
