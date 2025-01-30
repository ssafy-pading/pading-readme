import { useState } from "react";
// import { getProjectDetails } from "../../shared/apis/useProjectAxios";


function ProjectMemberList() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = async () => {
        // api 설계만
        // const response = await getProjectDetails(groupId, projectId);

        // setmemberList(response.data.users);
        setIsModalOpen(true);
    }
    const closeModal = () => setIsModalOpen(false);

    const [memberList, setmemberList] = useState([{ "name": "Heewon", "status": true }, { "name": "Member 2", "status": false }, { "name": "Member 3", "status": true }]);

    return (
        <div className="p-4">
            {/* 버튼 */}
            <button
                className="text-white bg-green-600 rounded-md px-4 py-2"
                onClick={openModal}
            >
                Member List
            </button>

            {/* 모달 */}
            {isModalOpen && (
                <div className="absolute left-1 top-48 inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    {/* 모달 컨텐츠 */}
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative z-50">
                        <h2 className="text-xl font-bold mb-4">Project Members</h2>
                        <ul>
                            {memberList.map((member, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <span className="mr-2">{member.status ? "🟢" : "🔴"}</span>
                                    <span
                                        className={`ml-2 font-medium transition-colors duration-200 whitespace-nowrap
                    ${member.status ? "text-green-600 hover:text-green-800" : "text-gray-600"}`}
                                    >
                                        {member.name}
                                    </span>
                                </div>
                            ))}
                        </ul>

                        {/* 닫기 버튼 */}
                        <button
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
                            onClick={closeModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectMemberList;
