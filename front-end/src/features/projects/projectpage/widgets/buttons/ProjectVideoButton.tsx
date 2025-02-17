import { useState } from 'react';
import { BsFillCameraVideoFill, BsCameraVideoOffFill } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { toggleVideo } from '../../../../../app/redux/videoConferenceSlice';
import { RootState } from '../../../../../app/redux/store';

function VideoButton() {
    const [isPressed, setIsPressed] = useState<boolean>(false);
    const dispatch = useDispatch();
    const isVideoOff = useSelector((state: RootState) => state.videoConference.isVideoOff);

    const handleVideoToggle = () => {
        dispatch(toggleVideo());
    };

    return (
        <button 
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onClick={handleVideoToggle} className={`text-white cursor-pointer transition-transform duration-200 ease-in-out ${isPressed ? "scale-75" : "scale-100"
        }`}>
            {isVideoOff ? <BsFillCameraVideoFill className="text-md" /> : <BsCameraVideoOffFill className="text-md" />}
        </button>
    )
}

export default VideoButton;