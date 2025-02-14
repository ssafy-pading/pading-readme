import { useState } from 'react';
import OpenViduComponent from './widgets/OpenViduComponent';
import ChatRoom from './widgets/components/ChatListComponents';

function RightContentsContainer(){
    const [isChatOpen, setIsChatOpen] = useState<boolean>(true);

    return(
        <div className="flex flex-col h-full overflow-hidden">
            {/* 화상 화면 영역 */}
            <div className="flex-1 min-h-0 relative">
                <div className="absolute inset-0">
                    <OpenViduComponent isChatOpen={isChatOpen} />
                </div>
            </div>

            {/* 채팅 영역 */}
            <div
                className={`bg-[#212426] transition-all relative ${
                    isChatOpen ? 'h-[50%]' : 'h-[50px]'
                } min-h-[50px] border-t border-[#666871] border-opacity-50`}
            >
                <ChatRoom isChatOpen={isChatOpen} onOpenStateChange={setIsChatOpen} />
            </div>
        </div>
    );
}

export default RightContentsContainer;