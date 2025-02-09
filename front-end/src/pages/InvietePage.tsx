import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGroupAxios from "../shared/apis/useGroupAxios";
import { GetGroupDetailsResponse, JoinGroupResponse } from "../shared/types/groupApiResponse";

const InvitePage = () => {
    const navigate = useNavigate();
    // const { inviteCode } = useParams<{ inviteCode: string }>();
    const { getGroupDetails, joinGroup } = useGroupAxios();
    const { groupId, inviteCode } = useParams<{ groupId:string, inviteCode:string }>();

    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [groupName, setGroupName] = useState<string | null>(null);
    useEffect(() => {
        
        // Particles.js 로드
        const particle = ():void => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/particles.js';
            script.onload = () => {
              // Particles.js 설정
              (window as any).particlesJS('particles-js', {
                particles: {
                  number: { value: 100 },
                  color: { value: '#ffffff' },
                  shape: { type: 'edge' },
                  opacity: { value: 0.8, random: true },
                  size: { value: 2 },
                  move: { enable: true, speed: 1, direction: 'top', straight: true, random: true },
                  line_linked: { enable: false },
                },
                interactivity: { 
                  detect_on: 'canvas',
                  events:{
                    onhover: { enable: false }, 
                    onclick: { enable: false }, 
                  },
                  resize:true 
                },
                modes: {
                  grab: { "distance": 0 },
                  bubble: { "distance": 0 },
                  repulse: { "distance": 0 },
                  push: { "particles_nb": 0 },
                  remove: { "particles_nb": 0 }
                }
              });
            };
            document.body.appendChild(script);
          }

          particle();
    },[])

    useEffect(() => {
        // 로그인 상태 확인 (사용자 인증 확인 함수)
        const checkAuthStatus = () => {
        const user = sessionStorage.getItem("accessToken"); // 여기에 사용자 상태 확인 로직 추가
        setIsAuthenticated(!!user);
        };

        // 그룹 정보 가져오기
        const fetchGroupInfo = async () => {
        try {
            if(groupId != undefined){
                const group:GetGroupDetailsResponse = await getGroupDetails(groupId); // 여기에 그룹 정보 가져오는 API 연결
                setGroupName(group?.name || "Unknown Group");
            }else{
                alert("잘못된 경로입니다.");
            }
        } catch (error) {
            setGroupName(null);
            console.log(error);
        }
        };

        checkAuthStatus();
        if(isAuthenticated){
            fetchGroupInfo();
        }
    }, [inviteCode, groupId, getGroupDetails, isAuthenticated]);

    const handleJoinGroup = async () => {
        try {
            // 그룹 참여 API 호출
            if(groupId != undefined && inviteCode != undefined){
                const groupDetails:JoinGroupResponse = await joinGroup(groupId, inviteCode);

                navigate(`/proectlist/${groupDetails.id}`); // 성공 시 그룹 페이지로 이동
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex min-h-screen h-full items-center justify-center bg-gray-900">
            <div id="particles-js" className="w-full h-full"></div>
            {/* <p className="text-5xl font-bold mb-8">Pading</p> */}
            <div className="px-7 pb-2 h-1/4 bg-white rounded-2xl shadow-2xl text-black text-center w-full max-w-md absolute">
                <div className="relative w-full h-full flex flex-col p-10 ">

                    {/* <div className="text-2xl font-bold">Pading</div> */}
                    <div className="text-xl font-bold ">환영합니다!</div>
                    {isAuthenticated === null ? (
                        <p className="text-gray-400 mt-2">Checking authentication...</p>
                    ) : isAuthenticated ? (
                        <>
                        <p className="text-lg break-all">"{groupName}"에 참여하시겠습니까?</p>
                        <button
                        onClick={handleJoinGroup}
                        className="bg-[#5C8290] hover:bg-[#3F6673] text-white font-bold py-2 px-4 rounded-lg mt-4 w-full absolute bottom-1 left-0"
                        >
                        그룹 참여
                        </button>
                    </>
                    ) : (
                        <>
                        <div className="text-lg break-all">그룹에 참여하시려면 로그인이 필요합니다.</div>
                        <button
                        onClick={() => navigate("/")}
                        className="bg-[#5C8290] hover:bg-[#3F6673] text-white font-bold py-2 px-4 rounded-lg mt-4 w-full absolute bottom-1 left-0"
                        >
                        로그인 페이지로 이동
                        </button>
                    </>
                    )}  
                </div>
                <p>{" "}</p>
            </div>
        </div>
    );
};

export default InvitePage;
