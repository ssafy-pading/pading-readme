// React
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ResizableBox } from "react-resizable";
import { VscChromeClose, VscAdd } from "react-icons/vsc";
import {
  ProjectEditorProvider,
  useProjectEditor,
} from "../context/ProjectEditorContext"; // useContext

// Widgets
import ProjectLeaveButton from "../features/projects/projectpage/widgets/buttons/ProjectLeaveButton";
import ParticipantsButton from "../features/projects/projectpage/widgets/buttons/ProjectParticipants";
import MuteButton from "../features/projects/projectpage/widgets/buttons/ProjectMuteButton";
import CamButton from "../features/projects/projectpage/widgets/buttons/ProjectCameraButton";

// Projects
import ProjectEditor from "../features/projects/editorterminal/components/ProjectEditor";
import ProjectTerminal from "../features/projects/editorterminal/components/ProjectTerminal";
import FileExplorer from "../features/projects/fileexplorer/components";
import RightContentsContainer from "../features/projects/videochat";

// Css
import "react-resizable/css/styles.css";
import "../features/projects/projectpage/css/ProjectPage.css";

// Api or Type
import useProjectAxios from "../shared/apis/useProjectAxios";
import DeployedLinkButton from "../features/projects/editorterminal/widgets/buttons/DeployedLinkButton";

function ProjectPage() {
  // Props
  const { groupId, projectId } = useParams<{
    groupId?: string;
    projectId?: string;
  }>();
  const { getProjectDetails } = useProjectAxios();

  // Project Information
  const [projectDetail, setprojectDetail] = useState<object | null>(null);
  useEffect(() => {
    getProjectDetails(Number(groupId), Number(projectId))
      .then((response) => {
        setDeployedLink(`http://${response.project.containerId}.pading.site`);
        setprojectDetail(response);
      })
      .catch((error) => {
        console.error("프로젝트 상세 정보 호출 오류: ", error);
      });
  }, [groupId, projectId, getProjectDetails]);

  // 배포 링크 주소
  const [deployedLink, setDeployedLink] = useState<string>("");

  // Chat
  const [isChatOpen, setIsChatOpen] = useState(true);

  {
    /*//////////////////////////////// Editor And Explorer  ////////////////////////////////////////*/
  }
  const { activeFileIndex, setActiveFileIndex, fileTap, setFileTap, user } =
    useProjectEditor();
  // 파일 탭 추가 함수 파일탐색기에서 클릭했을 때 추가하는 부분
  // 파일 탭 추가 함수 파일탐색기에서 클릭했을 때 추가하는 부분
  const addNewFile = () => {
    const newFile = {
      fileName: `NewFile${fileTap.length + 1}.js`,
      fileRouteAndName: `/path/to/NewFile${fileTap.length + 1}.js`,
    };
    setFileTap([...fileTap, newFile]);
    setActiveFileIndex(fileTap.length); // 새 탭을 활성화
  };
  // 파일 탭 추가 함수 파일탐색기에서 클릭했을 때 추가하는 부분
  // 파일 탭 추가 함수 파일탐색기에서 클릭했을 때 추가하는 부분

  // 파일 탭 삭제 함수
  const deleteFile = (index: number) => {
    const newFileTap = fileTap.filter((_, idx) => idx !== index);
    setFileTap(newFileTap);
    if (newFileTap.length < 1) {
      setActiveFileIndex(null);
      return;
    }
    // activeFileIndex가 null이 아닌지 확인
    if (activeFileIndex === null) {
      return;
    }
    if (activeFileIndex === index) {
      setActiveFileIndex(0);
    } else if (activeFileIndex > index) {
      setActiveFileIndex(activeFileIndex - 1);
    }
  };
  {
    /*//////////////////////////////// Editor And Explorer  ////////////////////////////////////////*/
  }
  {
    /*//////////////////////////////// Terminal State or Function  ////////////////////////////////////////*/
  }
  // 터미널 Resize
  const [isVerticalDragging, setIsVerticalDragging] = useState(false); // 드래그 상태 관리
  const [isHorizontalDragging, setIsHorizontalDragging] = useState(false); // 드래그 상태 관리
  const [terminalHeight, setTerminalHeight] = useState(250); // 터미널 높이 상태 관리
  const [isTerminalWidthChange, setisTerminalWidthChange] =
    useState<boolean>(true); // 터미널 너비 상태 관리
  // 터미널 상태 (터미널 id 배열로 관리)
  const [terminalIds, setTerminalIds] = useState<number[]>([0]);
  const [activeTerminal, setActiveTerminal] = useState(0); // 활성화된 터미널
  const [nextTerminalId, setNextTerminalId] = useState(1);
  // 터미널 생성
  const addNewTerminal = () => {
    setTerminalIds((prev) => {
      const newTerminalIds = [...prev, nextTerminalId];
      setActiveTerminal(newTerminalIds.length - 1);
      return newTerminalIds;
    });
    setNextTerminalId((prev) => prev + 1);
  };

  // 터미널 삭제
  const deleteTerminal = (index: number) => {
    setTerminalIds((prev) => {
      if (prev.length === 1) return prev; // 하나밖에 없으면 삭제하지 않음
      const newTerminalIds = prev.filter((_, i) => i !== index);
      setActiveTerminal((prevActive) =>
        prevActive >= newTerminalIds.length
          ? newTerminalIds.length - 1
          : prevActive
      );
      return newTerminalIds;
    });
  };

  {
    /*//////////////////////////////// Terminal State or Functions  ////////////////////////////////////////*/
  }
  return (
    <div className="flex flex-col h-screen">
      {/* 네비게이션 바 */}
      <div className="flex flex-row items-center gap-10 justify-between h-[30px] bg-[#212426] border-b border-[#666871] border-opacity-50 px-5 box-content select-none">
        <div className="flex items-center h-[25px] text-white text-sm">
          <p className="font-semibold text-center">
            PROJECT : {projectDetail?.project?.name}
          </p>
        </div>
        <div className="flex">
          <DeployedLinkButton link={deployedLink} />
        </div>
        <div className="flex items-center justify-center gap-20">
          <div className="flex items-center justify-center text-[#d4d4d4]">
            <ParticipantsButton />
          </div>
          {/* 버튼 */}
          <div className="flex items-center justify-center gap-4 mr-16">
            <MuteButton />
            <CamButton />
          </div>
          <div className="flex">
            <ProjectLeaveButton />
          </div>
        </div>
      </div>

      {/* 네비게이션을 제외한 컨텐츠 */}
      <div className="flex flex-row h-[calc(100vh-30px)]">
        {/* 파일 탐색기 컨테이너 */}
        <ResizableBox
          width={250}
          minConstraints={[100, Infinity]}
          maxConstraints={[600, Infinity]}
          height={Infinity}
          axis="x" // 드래그 종료
          onResizeStart={() => setIsHorizontalDragging(true)}
          onResizeStop={() => {
            setIsHorizontalDragging(false);
            setisTerminalWidthChange(!isTerminalWidthChange);
          }}
          handle={
            <span
              className={`absolute right-0 top-0 h-full ${
                isHorizontalDragging
                  ? "w-[3px] bg-[#3B82F6] cursor-col-resize"
                  : "w-[2px] bg-[#666871] opacity-50"
              }
              hover:w-[2px] hover:bg-[#3B82F6] cursor-col-resize`}
              style={{ zIndex: 10 }}
            />
          }
          handleSize={[5, 5]}
        >
          <div className="flex flex-col justify-start h-full bg-[#212426] select-none">
            <div className="w-full overflow-x-hidden">
              {/* 파일 탐색기 */}
              <FileExplorer />
            </div>
          </div>
        </ResizableBox>

        {/* 중앙 컨텐츠 */}
        <div className="flex-1 flex-col flex min-w-[600px]">
          <div className="h-full w-full top-0 left-0 right-0 bg-[#212426] flex flex-col justify-between text-[#141617]">
            {/* 파일 탭 자리 */}
            <div className="w-full h-[25px] bg-[#2F3336] border-b border-[#666871] border-opacity-50 flex">
              <div className="flex flex-1 items-center space-x-2 overflow-x-auto">
                {fileTap.map((file, index) => (
                  <div key={index} className="flex flex-row items-center">
                    <div
                      className={`cursor-pointer px-2 py-1 whitespace-nowrap ${
                        activeFileIndex === index
                          ? "border-t-4 border-b-[#3B82F6] text-white"
                          : "text-[#858595] hover:text-white"
                      }`}
                      onClick={() => setActiveFileIndex(index)}
                    >
                      {file.fileName}
                    </div>
                    {fileTap.length >= 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(index);
                        }}
                        className="text-[#858595] hover:text-white ml-1"
                      >
                        <VscChromeClose />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex-none">
                <button
                  onClick={addNewFile}
                  className="px-2 py-1 text-white hover:bg-blue-600"
                  title="Add new file"
                >
                  <VscAdd />
                </button>
              </div>
            </div>
            {/* 코드 편집기 자리 */}
            <div className="flex-1 w-full bg-[#212426] overflow-hidden text-cyan-100">
              {fileTap.length && activeFileIndex !== null ? (
                fileTap.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: activeFileIndex === index ? "block" : "none",
                    }}
                    className="w-full h-full"
                  >
                    <ProjectEditor
                      groupId={groupId}
                      projectId={projectId}
                      fileRouteAndName={file.fileRouteAndName}
                      userName={user.name}
                    />
                  </div>
                ))
              ) : (
                <div className="text-3xl font-bold text-center mt-40 text-[#2F3336] select-none">
                  <p>Pading IDE</p>
                </div>
              )}
            </div>
            <div className="w-full">
              <ResizableBox
                width={Infinity}
                height={250}
                axis="y"
                minConstraints={[Infinity, 150]}
                maxConstraints={[Infinity, 400]}
                resizeHandles={["n"]}
                handle={
                  <span
                    className={`absolute top-0 left-0 w-full ${
                      isVerticalDragging
                        ? "h-[3px] bg-[#3B82F6] cursor-row-resize"
                        : "h-[2px] bg-[#666871] opacity-50"
                    }
                    cursor-row-resize hover:h-[2px] hover:bg-[#3B82F6]`}
                    style={{ zIndex: 10 }}
                  />
                }
                onResizeStart={() => setIsVerticalDragging(true)}
                onResizeStop={(e, data) => {
                  setIsVerticalDragging(false);
                  setTerminalHeight(data.size.height);
                }}
              >
                {/* 터미널 */}
                <div className="bg-[#212426] h-full">
                  {/* 상단 탭과 + 버튼 */}
                  <div className="flex bg-[#212426] h-[30px] box-border pr-2 items-center space-x-2">
                    {/* 터미널 탭들 */}
                    <div className="flex flex-1 items-center space-x-2 box-border ml-4 gap-x-4 overflow-x-auto flex-grow select-none">
                      {terminalIds.map((id, index) => (
                        <div key={id} className="flex flex-row items-center">
                          <div
                            className={`items-center inline-flex justify-center h-full whitespace-nowrap ${
                              activeTerminal === index
                                ? "border-b-2 border-b-[#3B82F6] text-white"
                                : "bg-[#141617] text-[#858595] hover:text-white"
                            }  cursor-pointer`}
                            onClick={() => setActiveTerminal(index)}
                          >
                            Terminal ({id + 1})
                          </div>
                          {terminalIds.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTerminal(index);
                              }}
                              className="text-[#858595] hover:text-white ml-[5px] mt-[2px]"
                            >
                              <VscChromeClose />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* + 버튼 */}
                    <div className="flex-none">
                      <button
                        onClick={() => {
                          addNewTerminal();
                          setActiveTerminal(terminalIds.length); // 새로 추가된 터미널로 포커싱
                        }}
                        className="px-4 py-2 text-white hover:bg-blue-600 transition shrink-0"
                        title="Add new terminal"
                        style={{ position: "sticky", right: 0 }}
                      >
                        <VscAdd />
                      </button>
                    </div>
                  </div>

                  {/* 터미널 화면 */}
                  <div className="flex-1 w-full h-[calc(100% - 30px)] bg-[#141617] relative">
                    {terminalIds.map((id, index) => (
                      <div
                        key={id}
                        style={{
                          display: activeTerminal === index ? "block" : "none",
                        }}
                      >
                        <ProjectTerminal
                          active={activeTerminal === index}
                          height={terminalHeight - 30}
                          isTerminalWidthChange={isTerminalWidthChange}
                          groupId={groupId}
                          projectId={projectId}
                          // 필요하다면 각 터미널에 id 또는 기타 props 전달
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </ResizableBox>
            </div>
          </div>
        </div>

        {/* 오른쪽 메인 콘텐츠 */}
        <div className="flex flex-col h-full aspect-[1/3] overflow-hidden border-l border-[#666871] border-opacity-50">
          <RightContentsContainer />
        </div>
      </div>
    </div>
  );
}

export default ProjectPage;
