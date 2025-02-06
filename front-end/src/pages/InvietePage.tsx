import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGroupAxios from "../shared/apis/useGroupAxios";
import { GetGroupDetailsResponse } from "../shared/types/groupApiResponse";

const InvitePage = () => {
    const navigate = useNavigate();
    // const { inviteCode } = useParams<{ inviteCode: string }>();
    const { getGroupDetails } = useGroupAxios();
    const { groupId, inviteCode } = useParams<{ groupId:string, inviteCode:string }>();

    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [groupName, setGroupName] = useState<string | null>(null);


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
        navigate(`/group/${inviteCode}`); // 성공 시 그룹 페이지로 이동
        } catch (error) {
        console.error("Failed to join the group");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-blue-900">
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-white text-center max-w-md w-full">
            <div className="text-2xl font-bold">환영합니다!</div>
            {isAuthenticated === null ? (
            <p className="text-gray-400 mt-2">Checking authentication...</p>
            ) : isAuthenticated ? (
            <>
                <p className="text-lg mt-2">"{groupName}"에 참여하시겠습니까?</p>
                <button
                onClick={handleJoinGroup}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4 w-full"
                >
                그룹 참여
                </button>
            </>
            ) : (
            <>
                <p className="text-lg mt-2">그룹에 참여하시려면  로그인이 필요합니다.</p>
                <button
                onClick={() => navigate("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4 w-full"
                >
                로그인 페이지로 이동
                </button>
            </>
            )}
        </div>
        </div>
    );
};

export default InvitePage;
