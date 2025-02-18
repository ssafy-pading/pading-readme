import { useNavigate, useParams } from 'react-router-dom'
import { MdExitToApp } from "react-icons/md";
import { useDispatch } from 'react-redux';
import { leaveRoom } from '../../../../../app/redux/videoConferenceSlice';

function ProjectOutButton() {
    const { groupId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const handleaveRoom = () => {
        dispatch(leaveRoom());
        navigate(`/projectlist/${groupId}`)
    }

    return (
        <div>
            <button
                className="flex items-center justify-center text-[#A1A1AF] h-7 rounded-md"
                // onClick={() => navigate(`/projectlist/`)}
                onClick={handleaveRoom}
            >
                <MdExitToApp /><p className="text-xs font-bold">나가기</p>
            </button>
        </div>
    )
}

export default ProjectOutButton