import { useState } from "react";
import { Link } from "react-router-dom";
import ProjectEditor from "../widgets/projects/ProjectEditor";
import TerminalComponent from "../widgets/projects/ProjectTerminal";
import ProjectLeaveButton from "../widgets/projects/ProjectLeaveButton";
import ProjectMemberListButton from "../widgets/projects/ProjectMemberListButton";

import { ResizableBox } from 'react-resizable';

import 'react-resizable/css/styles.css';
import '../assets/css/ProjectPage.css'


function ProjectPage() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isVerticalDragging, setIsVerticalDragging] = useState(false); // 드래그 상태 관리
  const [isHorizontalDragging, setIsHorizontalDragging] = useState(false); // 드래그 상태 관리


  {/*//////////////////////////////// 터미널 변수, 함수  ////////////////////////////////////////*/ }
  const [terminals, setTerminals] = useState([<TerminalComponent key={0} />]); // 터미널 리스트
  const [activeTerminal, setActiveTerminal] = useState(0); // 활성화된 터미널

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
  {/*//////////////////////////////// 터미널 변수, 함수  ////////////////////////////////////////*/ }


  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 네비게이션 바 */}
      <div className="flex flex-row items-center h-[50px] bg-[#0F172A] border-b-2 border-[#273654] px-5 box-content">
        <div className="absolute left-1">
          <ProjectMemberListButton/>
        </div>
        <div className="absolute right-1">
          <ProjectLeaveButton />
        </div>
      </div>

      {/* 네비게이션을 제외한 컨텐츠 */}
      <div className="flex-1 flex flex-row justify-between">
        {/* 파일 탐색기 컨테이너너*/}
        <ResizableBox
          width={250}
          height={Infinity}
          axis="x"
          minConstraints={[200, Infinity]}
          maxConstraints={[500, Infinity]}
          onResizeStart={() => setIsVerticalDragging(true)} // 드래그 시작
          onResizeStop={() => setIsVerticalDragging(false)} // 드래그 종료
          handle={
            <span
              className={`absolute right-0 top-0 h-full ${isVerticalDragging ? 'w-[5px] bg-[#3B82F6]' : 'w-[2px] bg-[#273654]'}
              cursor-ew-resize hover:w-[4px] hover:bg-[#3B82F6]`}
              style={{ zIndex: 10 }}
            />
          }
          handleSize={[5, 5]}
        >
          <div className="flex flex-col justify-start h-full bg-[#0F172A]">
            <div className="w-full h-[30px] border-b-2 border-[#273654]">
              <b className="ml-4 text-white">Explorer</b>
            </div>
            <div className="w-full overflow-x-auto scroll pr-[10px]">
              {/* 파일 탐색기 들어갈 자리 */}
              {/* <FolderTree /> */}
            </div>
          </div>
        </ResizableBox>

        {/* 중앙 컨텐츠 */}
        <div className="flex-1 flex-col">
          {/* 코드 에디터 */}
          <div className="relative h-full top-0 left-0 right-0 bg-[#1E293B] flex justify-center text-[#0F172A]">
            <div className="mt-80">
              <p>코드 에디터</p>
            </div>
            <div className="absolute w-full bottom-0">
              <ResizableBox
                width={Infinity}
                height={250}
                axis="y"
                minConstraints={[Infinity, 150]}
                maxConstraints={[Infinity, 400]}
                resizeHandles={['n']}
                handle={
                  <span
                    className={`absolute top-0 left-0 w-full ${isHorizontalDragging ? 'h-[5px] bg-[#3B82F6]' : 'h-[2px] bg-[#273654]'}
                  cursor-ns-resize hover:h-[4px] hover:bg-[#3B82F6]`}
                    style={{ zIndex: 10 }}
                  />
                }
                onResizeStart={() => setIsHorizontalDragging(true)}
                onResizeStop={() => setIsHorizontalDragging(false)}
              >
                {/* 터미널 */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#0F172A] h-full">
                  {/* 상단 탭과 + 버튼 */}
                  <div className="flex bg-gray-800 px-4 py-2 items-center space-x-2">
                    {/* 터미널 탭들 */}
                    <div className="flex items-center space-x-2 overflow-x-auto flex-grow">
                      {terminals.map((_, index) => (
                        <div
                          key={index}
                          className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${activeTerminal === index
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-300"
                            } cursor-pointer`}
                          onClick={() => setActiveTerminal(index)}
                        >
                          Terminal
                          {terminals.length > 1 &&
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTerminal(index);
                              }}
                              className="ml-2 text-red-500 hover:text-red-400"
                            >
                              ✖
                            </button>
                          }
                        </div>
                      ))}
                    </div>

                    {/* + 버튼 */}
                    <div className="flex-none">
                      <button
                        onClick={() => {
                          addNewTerminal();
                          setActiveTerminal(terminals.length); // 새로 추가된 터미널로 포커싱
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition shrink-0"
                        title="Add new terminal"
                        style={{ position: 'sticky', right: 0 }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 터미널 화면 */}
                  <div className="flex flex-grow w-full bg-black p-4 overflow-auto">
                    {terminals[activeTerminal]}
                  </div>
                </div>

              </ResizableBox>
            </div>
          </div>
        </div>


        {/* 오른쪽 메인 콘텐츠 */}
        <div className="flex flex-col h-full aspect-[1/3] border-l-2 border-[#273654] overflow-hidden">
          {/* 캐러셀 */}
          <div className="bg-slate-400 flex-1 w-full overflow-hidden flex flex-col">
            {/* <VerticalCarousel items={carouselItems} isChatOpen={isChatOpen} /> */}
            <div className="relative h-1/2 bg-stone-700">
              <p>테스트1</p>
            </div>
            <div className="relative h-1/2 bg-stone-600">
              <p>테스트2</p>
            </div>
          </div>

          {/* 채팅 */}
          <div className={`flex flex-col bg-[#0F172A] w-full transition-all duration-300 ease-in-out ${isChatOpen ? 'flex-1' : 'h-0'}`}>
            <div className="flex w-full h-[30px] bg-[#273654] items-center">
              <b className="ml-4 text-white">Chat</b>
              {/* 채팅창 들어갈 자리리 */}
            </div>
          </div>
          {/* 채팅창 푸터(채팅 입력칸/채팅 열고 닫는 버튼이 들어갈 컴포넌트트) */}
          <div className="h-[50px] bg-[#0F172A] border-t-2 border-[#273654]">
            <button
              onClick={toggleChat}
              className="w-full h-full text-white focus:outline-none"
            >
              {isChatOpen ? '채팅 닫기' : '채팅 열기'}
            </button>
          </div>
        </div>
      </div>
      {/*/////////////////////////////////////////////////////////////////////////*/}
      {/*/////////////////////////////////////////////////////////////////////////*/}

    </div>
  );
};

export default ProjectPage;
