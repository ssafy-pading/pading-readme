import { useState } from 'react';
import { BsFillCameraVideoFill, BsCameraVideoOffFill } from 'react-icons/bs';

function CamButton() {
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
                {isMute ? <BsFillCameraVideoFill className="text-md" /> : <BsCameraVideoOffFill className="text-md" />}
            </div>
        </button>
    )
}

export default CamButton;