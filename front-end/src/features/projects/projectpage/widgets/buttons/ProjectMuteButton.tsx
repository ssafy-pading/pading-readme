import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMute } from '../../../../../app/redux/videoConferenceSlice';
import { RootState } from '../../../../../app/redux/store';
import { BsFillMicFill, BsFillMicMuteFill } from 'react-icons/bs';

const MuteButton = () => {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const dispatch = useDispatch();
  const isMute = useSelector((state: RootState) => state.videoConference.isMute);

  const handleMuteToggle = () => {
    dispatch(toggleMute());
  };

  return (
    <button
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={handleMuteToggle}
      className={`text-white cursor-pointer transition-transform duration-200 ease-in-out ${isPressed ? "scale-75" : "scale-100"
      }`}
    >
      {isMute ? <BsFillMicMuteFill /> : <BsFillMicFill />}
    </button>
  );
};

export default MuteButton;