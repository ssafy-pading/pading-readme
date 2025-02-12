import { useState, useEffect } from 'react';
import OpenViduComponent from './VideoConference/ui/OpenViduComponent';
import ChatRoom from '../../../widgets/ChatListComponents';

function RightContentsContainer(){
    const [isChatOpen, setIsChatOpen] = useState<boolean>(true);

    useEffect(() => {
        const totalHeight = `calc(100vh - 25px)`; // 50px(네비게이션) + 30px(버튼)
        const carouselHeight = isChatOpen 
          ? `calc((${totalHeight}-30px) * 0.5)` 
          : totalHeight;
    
        document.documentElement.style.setProperty('--carousel-container-height', carouselHeight);
      }, [isChatOpen]);

    return(
        <div className="flex flex-col h-full overflow-hidden">
            {/* 화상 화면  */}
            <div className="flex-1">
                <OpenViduComponent isChatOpen={isChatOpen} />
            </div>

            <div className={`bg-[#212426] border-t-2 border-white transition-all relative ${isChatOpen ? 'h-[calc(50%-50px)]' : 'h-0'}`}>
                {isChatOpen?(
                        <ChatRoom />                    
                ):(null)}
            </div>
            {/* 채팅  바로 밑 컨테이너의 border-top 흰색은 구분을 위한 것으로 컴포넌트 삽입 후 삭제 필요*/}
            
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="h-[30px] bg-[#2F3336] border-t border-[#666871] border-opacity-50 text-white"
            >
                {isChatOpen ? '▼ 채팅 닫기' : '▲ 채팅 열기'}
            </button>
        </div>
    );
}

export default RightContentsContainer;