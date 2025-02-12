import { useState } from "react";

function ParticipantsButton() {
    const [participantsCnt, setParticipantsCnt] = useState<number>(0);

    return(
        <div className="flex flex-row items-center justify-center">
            <div>{/* 이미지 들어갈 자라 */}</div>
            <div className="text-xs text-[#A1A1AF] font-bold">{participantsCnt} participants</div>
        </div>
    )
}

export default ParticipantsButton;