import { useState } from "react";

function ProjectMemberList() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

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
                        <ul className="list-disc ml-4">
                            <li>Member 1</li>
                            <li>Member 2</li>
                            <li>Member 3</li>
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
