import { useState } from "react";
import { ProjectEditorProvider } from "../context/ProjectEditorContext";
import ProjectEditor from "../features/projects/ProjectEditor";
import TerminalComponent from "../features/projects/ProjectTerminal";
import ProjectLeaveButton from "../features/projects/ProjectLeaveButton";
// import ProjectMemberListButton from "../features/projects/ProjectMemberListButton";
import FileExplorer from "../features/projects/FileExplorer";
import { VscChromeClose, VscAdd } from "react-icons/vsc";
import { ResizableBox } from 'react-resizable';
import MuteButton from "../features/projects/ProjectMuteButton";
import CamButton from "../features/projects/ProjectCameraButton";
import ParticipantsButton from "../features/projects/ProjectParticipants";

import 'react-resizable/css/styles.css';
import '../assets/css/ProjectPage.css'


function ProjectPage() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isVerticalDragging, setIsVerticalDragging] = useState(false); // 드래그 상태 관리
  const [isHorizontalDragging, setIsHorizontalDragging] = useState(false); // 드래그 상태 관리
  const [terminalHeight, setTerminalHeight] = useState(250); // 터미널 높이 상태 관리
  const [widthChange, setwidthChange] = useState<boolean>(true)

  {/*//////////////////////////////// 터미널 변수, 함수  ////////////////////////////////////////*/ }
  const [terminals, setTerminals] = useState([
    <TerminalComponent
      height={terminalHeight}
      key={0} />]); // 터미널 리스트
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
    <ProjectEditorProvider>
      <div className="flex flex-col h-screen">
        {/* 네비게이션 바 */}
        <div className="flex flex-row items-center gap-10 justify-between h-[50px] bg-[#0F172A] border-b-2 border-[#273654] px-5 box-content">
          <div className="flex items-center h-[35px] box-border bg-[#059669] rounded-md text-white px-4">
            {/* <ProjectMemberListButton/> */}
            Project : 프로젝트 이름
          </div>
          <div className="flex items-center justify-center gap-10">
            <div className="flex items-center justify-center text-[#d4d4d4]">
              <ParticipantsButton />
            </div>
            <div className="flex items-center justify-center gap-4 mr-32">
              <MuteButton />
              <CamButton />
            </div>
            <div className="flex">
              <ProjectLeaveButton />
            </div>
          </div>
        </div>

        {/* 네비게이션을 제외한 컨텐츠 */}
        <div className="flex-1 flex flex-row">
          {/* 파일 탐색기 컨테이너너*/}
          <ResizableBox
            width={300}
            minConstraints={[100, Infinity]}
            maxConstraints={[1000, Infinity]}
            height={Infinity}
            axis="x"// 드래그 종료
            onResizeStart={() => setIsHorizontalDragging(true)}
            onResizeStop={() => {
              setIsHorizontalDragging(false)
              setwidthChange(!widthChange)
            }
            }
            handle={
              <span
                className={`absolute right-0 top-0 h-full ${isHorizontalDragging ? 'w-[5px] bg-[#3B82F6] cursor-col-resize' : 'w-[2px] bg-[#273654]'}
              hover:w-[4px] hover:bg-[#3B82F6] cursor-col-resize`}
                style={{ zIndex: 10 }}
              />
            }
            handleSize={[5, 5]}
          >
            <div className="flex flex-col justify-start h-full bg-[#0F172A]">
              <div className="w-full overflow-x-hidden">
                {/* 파일 탐색기 들어갈 자리 */}
                <FileExplorer />
              </div>
            </div>
          </ResizableBox>

          {/* 중앙 컨텐츠 */}
          <div className="flex-1 flex-col flex min-w-[600px]">
            <div className="h-full w-full top-0 left-0 right-0 bg-[#1E293B] flex flex-col justify-between text-[#0F172A]">
              <div className="w-full h-[30px] bg-[#1E293B]">
                {/* 파일 탭 자리 */}
              </div>
              {/* 코드 편집기 자리 */}
              <div className="flex-1 w-full bg-[#0F172A]">
                {/* <p className="text-3xl">Pading</p> */}
                {/* <ProjectEditor /> */}
              </div>
              <div className="w-full">
                <ResizableBox
                  width={Infinity}
                  height={250}
                  axis="y"
                  minConstraints={[Infinity, 150]}
                  maxConstraints={[Infinity, 400]}
                  resizeHandles={['n']}
                  handle={
                    <span
                      className={`absolute top-0 left-0 w-full ${isVerticalDragging ? 'h-[5px] bg-[#3B82F6] cursor-row-resize' : 'h-[2px] bg-[#273654]'}
                    cursor-row-resize hover:h-[4px] hover:bg-[#3B82F6]`}
                      style={{ zIndex: 10 }}
                    />
                  }
                  onResizeStart={() => setIsVerticalDragging(true)}
                  onResizeStop={(e, data) => {
                    setIsVerticalDragging(false)
                    setTerminalHeight(data.size.height);
                  }}
                >
                  {/* 터미널 */}
                  <div className="bg-[#0F172A] h-full">
                    {/* 상단 탭과 + 버튼 */}
                    <div className="flex bg-[#0F172A] h-[30px] box-border pr-2 items-center space-x-2">
                      {/* 터미널 탭들 */}
                      <div className="flex flex-1 items-center space-x-2 box-border ml-4 gap-x-4 overflow-x-auto flex-grow">
                        {terminals.map((_, index) => (
                          <div className="flex flex-row items-center">
                            <div
                              key={index}
                              className={`items-center inline-flex justify-center h-full whitespace-nowrap ${activeTerminal === index
                                ? "border-b-2 border-b-[#3B82F6] text-white"
                                : "bg-[#0F172A] text-[#858595] hover:text-white"
                                }  cursor-pointer`}
                              onClick={() => setActiveTerminal(index)}
                            >
                              Terminal
                            </div>
                            {terminals.length > 1 &&
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTerminal(index);
                                }}
                                className="text-[#858595] hover:text-white ml-[5px] mt-[2px]"
                              >
                                <VscChromeClose />
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
                          className="px-4 py-2 text-white hover:bg-blue-600 transition shrink-0"
                          title="Add new terminal"
                          style={{ position: 'sticky', right: 0 }}
                        >
                          <VscAdd />
                        </button>
                      </div>
                    </div>

                    {/* 터미널 화면 */}
                    <div className="flex-1 w-full h-[calc(100%-30px)] bg-[#0F172A] relative">
                      {/* {terminals[activeTerminal]} */}
                      <TerminalComponent
                        height={terminalHeight - 30}
                        widthChange={widthChange}
                        key={activeTerminal} />
                    </div>
                  </div>

                </ResizableBox>
              </div>
            </div>
          </div>


          {/* 오른쪽 메인 콘텐츠 */}
          <div className="flex flex-col h-full aspect-[1/3] border-l-2 border-[#273654] overflow-hidden">
            {/* 캐러셀 */}

            {/* <VerticalCarousel items={carouselItems} isChatOpen={isChatOpen} /> */}
            {isChatOpen ?
              <div className="bg-slate-400 flex-1 w-full overflow-hidden flex flex-col">
                <div className="relative h-1/2 bg-stone-700">
                  <p>테스트1</p>
                </div>
                <div className="relative h-1/2 bg-stone-600">
                  <p>테스트2</p>
                </div>
              </div>
              :
              <div className="bg-slate-400 flex-1 w-full overflow-hidden flex flex-col">
                <div className="relative h-1/4 bg-stone-700">
                  <p>테스트1</p>
                </div>
                <div className="relative h-1/4 bg-stone-600">
                  <p>테스트2</p>
                </div>
                <div className="relative h-1/4 bg-stone-700">
                  <p>테스트3</p>
                </div>
                <div className="relative h-1/4 bg-stone-600">
                  <p>테스트4</p>
                </div>
              </div>
            }


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
    </ProjectEditorProvider>
  );
};

export default ProjectPage;
