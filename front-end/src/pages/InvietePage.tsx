import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGroupAxios from "../shared/apis/useGroupAxios";
import { GetGroupDetailsResponse, GetGroupMembersResponse, JoinGroupResponse } from "../shared/types/groupApiResponse";
import { Toaster, toast } from 'react-hot-toast';


// redux 초기 import 
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserInfo } from '../app/redux/user';
import type { RootState, AppDispatch } from '../app/redux/store';

// import 
import ProjectSpinner from "../features/projects/projectpage/widgets/spinners/ProjectSpinner";

declare global {
    interface Window {
      particlesJS: (elementId: string, options: ParticlesOptions) => void;
    }
  }
  
interface ParticlesOptions {
    particles: {
      number: { value: number };
      color: { value: string };
      shape: { type: string };
      opacity: { value: number; random: boolean };
      size: { value: number };
      move: {
        enable: boolean;
        speed: number;
        direction: string;
        straight: boolean;
        random: boolean;
      };
      line_linked: { enable: boolean };
    };
    interactivity: {
      detect_on: string;
      events: {
        onhover: { enable: boolean };
        onclick: { enable: boolean };
      };
      resize: boolean;
    };
    modes: {
      grab: { distance: number };
      bubble: { distance: number };
      repulse: { distance: number };
      push: { particles_nb: number };
      remove: { particles_nb: number };
    };
  }

const InvitePage = () => {
    const navigate = useNavigate();
    // const { inviteCode } = useParams<{ inviteCode: string }>();
    const { getGroupDetails, joinGroup, getGroupMembers } = useGroupAxios();
    const { groupId, inviteCode } = useParams<{ groupId:string, inviteCode:string }>();

    // redux dispatch, 유저 객체 사용
    const dispatch = useDispatch<AppDispatch>();
    const { user, status } = useSelector((state: RootState) => state.user);

    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [groupName, setGroupName] = useState<string | null>(null);

    // 로딩 렌더링 보여주기
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        
        // Particles.js 로드
        const particle = ():void => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/particles.js';
            script.onload = () => {
              // Particles.js 설정
              (window).particlesJS('particles-js', {
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
    },[isLoading])
    
    useEffect(() => {
      const checkAuthStatus = async () => {
        if (!user && status === 'idle') {
          await dispatch(fetchUserInfo());
        }
      };
      checkAuthStatus();
    }, [user, status, dispatch]);

    // 유저가 로그인 상태인지 체크
    useEffect(() => {
      // user 상태에 따라 인증 여부를 설정하는 효과
      const isLogin = !!localStorage.getItem("accessToken");
      if (isLogin) {
        setIsAuthenticated(true);
      } else {
        setIsLoading(false); // 화면 렌더링
        setIsAuthenticated(false);
      }
    }, [user]);


    useEffect(() => {

      // 그룹 정보 가져오기
      const fetchGroupInfo = async () => {
        try {
            if(groupId != undefined){
                const group:GetGroupDetailsResponse = await getGroupDetails(Number(groupId)); // 여기에 그룹 정보 가져오는 API 연결

                setGroupName(group?.name || "Unknown Group");
                setIsLoading(false); // 오류 없으면 로그인 화면 렌더링
            }else{
              toast.error("잘못된 경로입니다.");
              navigate('/');
            }
        } catch (error) {
            setGroupName(null);
            console.log(error);
        }
      };

      const userJoined = async () => {
        try {
          const groupMembers:GetGroupMembersResponse = await getGroupMembers(Number(groupId));
          if(groupMembers.users.find((member) => {
            if(member !== null){
              return member.id == user?.id;
            }
          })){
            toast.error("이미 가입한 그룹입니다.");
            navigate(`/projectlist/${groupId}`); // 성공 시 그룹 페이지로 이동
            return true;
          }
        }catch (err){
          console.log(err)
          return true;
        }
      }
      const apiCheck = async() => {
        if(isAuthenticated && await userJoined()){
          // 그룹의 정보 불러오기
          await fetchGroupInfo();
        }
      }
      apiCheck();
    }, [inviteCode, groupId, getGroupDetails, isAuthenticated, getGroupMembers, navigate, user]);

    // 그룹 참여하기
    const handleJoinGroup = async () => {
        try {
            // 그룹 참여 API 호출
            if(groupId != undefined && inviteCode != undefined){
                const groupDetails:JoinGroupResponse = await joinGroup(Number(groupId), inviteCode);
                toast.success(`${groupName} 그룹 참가에 성공했습니다!`);
                navigate(`/projectlist/${groupDetails.id}`); // 성공 시 그룹 페이지로 이동
            }
        } catch (error:any) {
            console.error(error);
            if (error.response && error.response.status === 400) {
              toast.error("그룹 정원이 가득 찼습니다. 그룹 오너(매니저)에게 문의하세요.");
            };
        }
    };

    // 그룹 참여 
    const handleRedirectLogin = async () => {
      sessionStorage.setItem("redirectPath", window.location.pathname);
      setIsLoading(true); // 오류 잠깐 숨기기
      navigate("/");
    }

    if (isLoading) {
      return (
        <div>
          <Toaster
            toastOptions={{
              style: {
                zIndex: 9999,  // 최상위로 보이게 설정
              },
            }} />
          <ProjectSpinner />;
        </div>)
    }

    return (
        <div className="flex min-h-screen h-full items-center justify-center bg-gray-900">
            <Toaster
              toastOptions={{
                style: {
                  zIndex: 9999,  // 최상위로 보이게 설정
                },
              }} />
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
                        onClick={handleRedirectLogin}
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
