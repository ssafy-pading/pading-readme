import { useState } from 'react';
import OpenViduComponent from './widgets/components/OpenViduComponent';
import CodeReviewComponent from './widgets/components/CodeReviewComponent';
import ChatReviewTabs from './widgets/components/ChatReviewTabs';

function RightContentsContainer(){
    const [isOpen, setIsOpen] = useState<boolean>(true);

    return(
        <div className="flex flex-col h-full overflow-hidden">
            {/* 화상 화면 영역 */}
            <div className="flex-1 min-h-0 relative">
                <div className="absolute inset-0">
                    <OpenViduComponent isChatOpen={isOpen} />
                </div>
            </div>

            {/* 채팅 영역 */}
            <div
                className={`bg-[#212426] transition-all relative ${
                    isOpen ? 'h-[50%]' : 'h-[30px]'
                } min-h-[30px] border-t border-[#666871] border-opacity-50`}
            >
                <ChatReviewTabs
                    isOpen={isOpen} 
                    onOpenStateChange={setIsOpen}
                />
            </div>
        </div>
    );
}

export default RightContentsContainer;