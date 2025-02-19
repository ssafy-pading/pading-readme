// React
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import VideoButton from "../features/projects/projectpage/widgets/buttons/ProjectVideoButton";
import DeployedLinkButton from "../features/projects/editorterminal/widgets/buttons/DeployedLinkButton";
import RunButton from "../features/projects/editorterminal/widgets/buttons/RunButton";

// Projects
import ProjectEditor from "../features/projects/editorterminal/components/ProjectEditor";
import ProjectTerminal from "../features/projects/editorterminal/components/ProjectTerminal";
import FileExplorer from "../features/projects/fileexplorer/components";
import RightContentsContainer from "../features/projects/videochat";
import ResourceMonitorBar from "../features/projects/monitoring/components/MonitoringBar";
import ProjectRun from "../features/projects/editorterminal/components/ProjectRun";
// Models
import { getMonitoringResource } from "../features/projects/monitoring/model/resourceModel";

// Css
import "react-resizable/css/styles.css";
import "../features/projects/projectpage/css/ProjectPage.css";

// toast
import { Toaster, toast } from "react-hot-toast";

// Api or Type
import useProjectAxios from "../shared/apis/useProjectAxios";
import { FileTapType } from "../shared/types/projectApiResponse";
import { ResourceData } from "../features/projects/monitoring/types/monitoringTypes";
import { GetProjectDetailsResponse } from "../shared/types/projectApiResponse";
import ProjectSpinner from "../features/projects/projectpage/widgets/spinners/ProjectSpinner";
import MonitoringDashboard from "../features/projects/monitoring/components/MonitoringDashboard";

function ProjectPage() {
  // 로딩 상태 체크
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 네이게이션
  const navigate = useNavigate();

  // Props
  const { groupId, projectId } = useParams<{
    groupId?: string;
    projectId?: string;
  }>();
  const { getProjectDetails } = useProjectAxios();

  // 배포 링크 주소
  const [deployedLink, setDeployedLink] = useState<string>("");

  // Project Information
  const [projectDetail, setProjectDetail] =
    useState<GetProjectDetailsResponse | null>(null);
  useEffect(() => {
    getProjectDetails(Number(groupId), Number(projectId))
      .then((response) => {
        setIsLoading(false);
        setDeployedLink(`https://${response.project.deploymentUrl}`);
        setProjectDetail(response);
      })
      .catch((error) => {
        console.error("프로젝트 상세 정보 호출 오류: ", error);
        if (
          error.response &&
          (error.response.status === 400 || error.response.status === 403)
        ) {
          toast.error(
            "접근 권한이 없습니다. 그룹 오너(매니저)에게 문의하세요."
          );
          navigate(`/projectlist/${groupId}`);
        }
      });
  }, [groupId, projectId, getProjectDetails]);

  // // Chat
  // const [isChatOpen, setIsChatOpen] = useState(true);

  {
    /*//////////////////////////////// Editor And Explorer  ////////////////////////////////////////*/
  }
  const { activeFile, setActiveFile, fileTap, setFileTap, user, deleteFile } =
    useProjectEditor();


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
  const [activeTerminal, setActiveTerminal] = useState<number>(0); // 활성화된 터미널
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

  // 터미널 Tab 상태 관리
  const [activePanel, setActivePanel] = useState<
    "terminal" | "run" | "resource"
  >("terminal");
  // 터미널 실행 버튼이 눌러졌는지에 대한 상태 관리
  const [executeRunCommand, setExecuteRunCommand] = useState<boolean>(false);
  // 파일 실행 버튼 클릭시 호출 되는 함수
  const handleFileExecution = async () => {
    setActivePanel("run"); // 실행 결과 탭으로 전환
    setExecuteRunCommand(true); // 버튼을 누른 상태로 전환
  };

  {
    /*//////////////////////////////// Terminal State or Functions  ////////////////////////////////////////*/
  }

  {
    /*//////////////////////////////// Monitoring Resource State or Function  ////////////////////////////////////////*/
  }

  const [monitoringDataList, setMonitoringDataList] = useState<ResourceData[]>(
    []
  );
  const [triggerFetch, setTriggerFetch] = useState(false);

  useEffect(() => {
    if (!projectDetail?.project?.containerId) return;

    const fetchMonitoringData = async () => {
      try {
        const monitoringData = await getMonitoringResource(
          projectDetail.project.containerId,
          projectDetail.project.performance.cpuDescription
        );
        // 이전 데이터 배열에 새 데이터를 추가 (불변성 유지)
        setMonitoringDataList((prevList) => [...prevList, monitoringData]);
      } catch (error) {
        console.error("Failed to fetch monitoring data:", error);
      }
    };

    fetchMonitoringData(); // 첫 호출
    const intervalId = setInterval(fetchMonitoringData, 5000); // 5초마다 호출

    return () => clearInterval(intervalId); // 언마운트 시 정리
  }, [triggerFetch]);

  // 예시: 특정 조건이 만족되면 triggerFetch 변경 (projectDetail.containerId가 변경될 때)
  useEffect(() => {
    if (projectDetail?.project?.containerId) {
      setTriggerFetch((prev) => !prev);
    }
  }, [projectDetail?.project?.containerId]);

  {
    /*//////////////////////////////// Monitoring Resource State or Function  ////////////////////////////////////////*/
  }
  if (isLoading) {
    return (
      <div>
        <Toaster
          toastOptions={{
            style: {
              zIndex: 9999, // 최상위로 보이게 설정
            },
          }}
        />
        <ProjectSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 네비게이션 바 */}
      <div className="flex flex-row items-center gap-10 justify-between h-[30px] bg-[#212426] border-b border-[#666871] border-opacity-50 px-5 box-content select-none">
        <div className="flex items-center h-[25px] text-white text-sm">
          <p className="font-semibold text-center">
            PROJECT : {projectDetail?.project?.name}
          </p>
          <div className="flex items-center justify-center text-[#d4d4d4] ml-5">
            <ParticipantsButton />
          </div>
        </div>
        <div className="flex items-center justify-center gap-20">
          {/* 버튼 */}
          <div className="flex items-center justify-center gap-4 mr-16">
            <RunButton onExecute={handleFileExecution} />
            <DeployedLinkButton link={deployedLink} />
            <MuteButton />
            <VideoButton />
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
            />
          }
          handleSize={[5, 5]}
        >
          <div className="flex flex-col justify-between h-full bg-[#212426] select-none">
            <div className="flex-1 min-h-0 w-full overflow-x-hidden">
              {/* 파일 탐색기 */}
              <FileExplorer />
            </div>
            <div className="w-full overflow-x-hidden">
              {/* 리소스 모니터링 바 */}
              <ResourceMonitorBar monitoringDataList={monitoringDataList} />
            </div>
          </div>
        </ResizableBox>

        {/* 중앙 컨텐츠 */}
        <div className="flex-1 flex-col flex min-w-[600px]">
          <div className="h-full w-full top-0 left-0 right-0 bg-[#212426] flex flex-col justify-between text-[#141617]">
            {/* 파일 탭 자리 */}
            <div className="w-full h-[25px] bg-[#2F3336] border-b border-[#666871] border-opacity-50 flex">
              <div className="flex flex-1 items-center space-x-2 overflow-x-auto overflow-y-hidden scroll">
                {fileTap.map((file) => (
                  <div
                    key={file.fileRouteAndName}
                    className="flex flex-row items-center"
                  >
                    <div
                      className={`cursor-pointer px-2 py-1 whitespace-nowrap ${
                        activeFile === file.fileRouteAndName
                          ? "text-white"
                          : "text-[#858595] hover:text-white"
                      }`}
                      onClick={() => setActiveFile(file.fileRouteAndName)}
                    >
                      {file.fileName}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file.fileRouteAndName);
                      }}
                      className="text-[#858595] hover:text-white ml-1"
                    >
                      <VscChromeClose />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* 코드 편집기 자리 */}
            <div className="flex-1 w-full bg-[#212426] overflow-hidden text-cyan-100">
              {fileTap.length > 0 ? (
                fileTap.map((file) => (
                  <div
                    key={file.fileRouteAndName}
                    style={{
                      display:
                        activeFile === file.fileRouteAndName ? "block" : "none",
                    }}
                    className="w-full h-full"
                  >
                    <ProjectEditor
                      groupId={groupId}
                      projectId={projectId}
                      framework={projectDetail?.project.projectImage.language}
                      fileRouteAndName={file.fileRouteAndName}
                      userName={user.name}
                      content={file.content}
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
                    <div className="flex flex-1 items-center space-x-2 box-border ml-4 gap-x-4 overflow-x-auto flex-grow select-none scroll">
                      {/* Run 탭 */}
                      <button
                        className={`items-center inline-flex justify-center h-full whitespace-nowrap ${
                          activePanel === "run"
                            ? "border-b-2 border-b-[#3B82F6] text-white"
                            : "text-[#858595] hover:text-white"
                        } cursor-pointer`}
                        onClick={() => {
                          setActivePanel("run");
                        }}
                      >
                        Run
                      </button>

                      {/* Resource 탭 */}
                      <button
                        className={`items-center inline-flex justify-center h-full whitespace-nowrap ${
                          activePanel === "resource"
                            ? "border-b-2 border-b-[#3B82F6] text-white"
                            : "text-[#858595] hover:text-white"
                        } cursor-pointer`}
                        onClick={() => setActivePanel("resource")}
                      >
                        Resource
                      </button>
                      {/* Terminal 탭 */}
                      {activePanel !== "terminal" && (
                        <button
                          className={`items-center inline-flex justify-center h-full whitespace-nowrap text-white cursor-pointer`}
                          onClick={() => setActivePanel("terminal")}
                        >
                          Terminal
                        </button>
                      )}
                      {/* 터미널 탭 리스트 (항상 렌더링, 단지 CSS로 보이고 안보임 처리) */}
                      <div
                        className="flex space-x-2"
                        style={{
                          display: activePanel === "terminal" ? "flex" : "none",
                        }} /* 수정: display를 flex로 유지 */
                      >
                        {terminalIds.map((id, index) => (
                          <div key={id} className="flex flex-row items-center">
                            <div
                              className={`items-center inline-flex justify-center h-full whitespace-nowrap ${
                                activePanel === "terminal" &&
                                activeTerminal === index
                                  ? "border-b-2 border-b-[#3B82F6] text-white"
                                  : "text-[#858595] hover:text-white"
                              } cursor-pointer`}
                              onClick={() => {
                                setActivePanel("terminal");
                                setActiveTerminal(index);
                              }}
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
                    </div>

                    {/* + 버튼 */}
                    <div className="flex-none">
                      <button
                        onClick={() => {
                          addNewTerminal();
                          setActivePanel("terminal");
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

                  {/* 패널 영역: 두 패널 모두 항상 렌더링 */}
                  <div className="flex-1 w-full h-[calc(100% - 30px)] relative">
                    {/* 런 패널 */}
                    <div
                      className="bg-[#141617] w-full h-full"
                      style={{
                        display: activePanel === "run" ? "block" : "none",
                      }} /* 수정: CSS로 런 패널 보이기/숨기기 */
                    >
                      <ProjectRun
                        active={true}
                        height={terminalHeight - 30}
                        isTerminalWidthChange={isTerminalWidthChange}
                        groupId={groupId}
                        projectId={projectId}
                        runCommand={projectDetail?.project.runCommand}
                        mode="run"
                        executeRunCommand={executeRunCommand}
                        onRunCommandExecuted={() => setExecuteRunCommand(false)}
                      />
                    </div>

                    {/* Resource 패널 */}
                    <div
                      className="bg-[#141617] w-full h-full overflow-hidden"
                      style={{
                        display: activePanel === "resource" ? "block" : "none",
                      }}
                    >
                      <MonitoringDashboard
                        data={monitoringDataList}
                        height={terminalHeight - 30}
                      />
                    </div>
                    {/* 터미널 패널 */}
                    <div
                      className="bg-[#141617] w-full h-full"
                      style={{
                        display: activePanel === "terminal" ? "block" : "none",
                      }} /* 수정: CSS로 터미널 패널 보이기/숨기기 */
                    >
                      {terminalIds.map((id, index) => (
                        <div
                          key={id}
                          style={{
                            display:
                              activeTerminal === index ? "block" : "none",
                          }}
                        >
                          <ProjectTerminal
                            active={activeTerminal === index}
                            height={terminalHeight - 30}
                            isTerminalWidthChange={isTerminalWidthChange}
                            groupId={groupId}
                            projectId={projectId}
                          />
                        </div>
                      ))}
                    </div>
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
