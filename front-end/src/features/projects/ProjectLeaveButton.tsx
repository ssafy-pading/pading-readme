import { useNavigate, useParams } from 'react-router-dom'

function ProjectOutButton() {
    // const { groupId } = useParams()
    const navigate = useNavigate()


    return (
        <div>
            <button
                className="flex items-center justify-center text-white bg-[#EF4444] h-7 px-4 rounded-md"
                onClick={() => navigate(`/projectlist/`)}
                // onClick={() => navigate(`/project/${groupId}`)}
            >
                <p className="text-sm">Leave</p>
            </button>
        </div>
    )
}

export default ProjectOutButton