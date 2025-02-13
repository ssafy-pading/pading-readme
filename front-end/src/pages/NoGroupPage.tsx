import React, { useEffect } from "react";
import { NavigationProvider, useNavigation } from "../context/navigationContext";
import ProfileNavigationBar from "../widgets/ProfileNavigationBar";
import GroupNavigationBar from "../widgets/GroupNavigationBar";
import robot from "../assets/robot.png";
import useGroupAxios from "../shared/apis/useGroupAxios";

const NoGroupPage: React.FC = () => {
  const { isProfileNavOpen } = useNavigation(); // 사이드바 상태 가져오기
  const { getGroups } = useGroupAxios();

  useEffect(() => {
    // 그룹 목록 조회 후 그룹이 존재하면 첫 번째 그룹 페이지로 리다이렉트
    const checkGroups = async () => {
      try {
        const groupsResponse = await getGroups();
        if (groupsResponse.groups && groupsResponse.groups.length > 0) {
          // 그룹이 존재하면 첫 번째 그룹 페이지로 이동
          window.location.href = `/projectlist/${groupsResponse.groups[0].id}`;
        }
      } catch (error) {
        console.error("그룹 목록 조회 중 오류:", error);
      }
    };
    checkGroups();
  }, [getGroups]);

  return (
    <div className="flex h-screen">
      {/* 메인 콘텐츠 영역 */}
      <div
        className={`flex flex-1 flex-col items-center justify-center transition-all duration-1000 ${
          isProfileNavOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* 로봇 이미지 */}
        <div className="w-96 h-96 flex items-center justify-center">
          <img src={robot} alt="No Group" className="h-full w-auto" />
        </div>

        {/* 메시지 */}
        <h2 className="text-xl font-semibold text-gray-800 mt-4">
          No Projects Found
        </h2>
        <p className="text-gray-600">
          Looks like you haven't created any projects yet.
        </p>
      </div>

      <ProfileNavigationBar />
      <GroupNavigationBar />
    </div>
  );
};

const WrappedNoGroupPage: React.FC = () => {
  return (
    <NavigationProvider>
      <NoGroupPage />
    </NavigationProvider>
  );
};

export default WrappedNoGroupPage;
