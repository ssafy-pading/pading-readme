import { useNavigate, useParams } from 'react-router-dom'
import { MdExitToApp } from "react-icons/md";

function ProjectOutButton() {
    // const { groupId } = useParams()
    const navigate = useNavigate()


    return (
        <div>
            <button
                className="flex items-center justify-center text-[#A1A1AF] h-7 rounded-md"
                onClick={() => navigate(`/projectlist/`)}
                // onClick={() => navigate(`/project/${groupId}`)}
            >
                <MdExitToApp /><p className="text-xs font-bold">나가기</p>
            </button>
        </div>
    )
}

export default ProjectOutButton