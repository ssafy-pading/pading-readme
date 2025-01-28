import { useNavigate, useParams } from 'react-router-dom'

function ProjectOutButton() {
    // const { groupId } = useParams()
    const navigate = useNavigate()


    return (
        <div>
            <button
                className="text-white bg-red-500 px-4 py-2 rounded-md"
                onClick={() => navigate(`/projectlist/`)}
                // onClick={() => navigate(`/project/${groupId}`)}
            >
                Leave
            </button>
        </div>
    )
}

export default ProjectOutButton