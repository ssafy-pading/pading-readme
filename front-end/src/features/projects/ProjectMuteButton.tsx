import { useState } from 'react';
import { BsFillMicFill, BsFillMicMuteFill } from 'react-icons/bs';

function MuteButton() {
    const [isMute, setIsMute] = useState<boolean>(false);
    const [isClicked, setIsClicked] = useState<boolean>(false);

    return (
        <button onClick={() => setIsMute(!isMute)} className='text-white'>
            <div
                className={`cursor-pointer transition-transform duration-200 ease-in-out ${isClicked ? "scale-75" : "scale-100"
                    }`}
                onClick={() => setIsMute(!isMute)}
                onMouseDown={() => setIsClicked(true)}
                onMouseUp={() => setIsClicked(false)} 
                onMouseLeave={() => setIsClicked(false)}
            >
                {isMute ? <BsFillMicMuteFill className="text-md" /> : <BsFillMicFill className="text-md" />}
            </div>
        </button>
    )
}

export default MuteButton;