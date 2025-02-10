import { useState } from 'react';
import OpenViduComponent from './VideoConference/ui/OpenViduComponent';

function RightContentsContainer(){
    const [isChatOpen, setIsChatOpen] = useState<boolean>(true);

    return(
        <div className="flex flex-col h-[calc(100vh-35px)] border-l-2 border-[#273654] overflow-hidden">
            {/* 화상 화면  */}
            <div className="flex-1">
                <OpenViduComponent isChatOpen={isChatOpen} />
            </div>

            {/* 채팅  바로 밑 컨테이너의 border-top 흰색은 구분을 위한 것으로 컴포넌트 삽입 후 삭제 필요*/}
            <div className={`bg-[#0F172A] border-t-2 border-white transition-all relative ${isChatOpen ? 'h-[calc(50%-50px)]' : 'h-0'}`}>

            </div>
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="h-[50px] bg-[#0F172A] border-t-2 border-[#273654] text-white"
            >
                {isChatOpen ? '▼ 채팅 닫기' : '▲ 채팅 열기'}
            </button>
        </div>
    );
}

export default RightContentsContainer;