import { useNavigate, useParams } from 'react-router-dom'

function ProjectOutButton() {
    // const { groupId } = useParams()
    const navigate = useNavigate()


    return (
        <div>
            <button
                className="flex items-center text-white bg-[#EF4444] h-[35px] px-4 rounded-md"
                onClick={() => navigate(`/projectlist/`)}
                // onClick={() => navigate(`/project/${groupId}`)}
            >
                Leave
            </button>
        </div>
    )
}

export default ProjectOutButton