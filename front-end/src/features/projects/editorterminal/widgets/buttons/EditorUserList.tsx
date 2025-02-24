// EditorUserList.jsx 또는 EditorUserList.tsx
import React, { useState } from 'react';
import { Users, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface EditorUserListProps {
    fileName?: string;
    users: string[]
}
const EditorUserList: React.FC<EditorUserListProps> = ({ fileName, users = [] }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  // 랜덤 색상 생성 함수
  const getUserColor = (userName:string): string => {
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF)
      .toString(16)
      .toUpperCase()
      .padStart(6, '0');
    return `#${c}`;
  };

  return (
    <div className="relative">
      <button 
        className="flex items-center gap-2 bg-gray-800 text-white text-sm px-3 py-1 rounded-md shadow hover:bg-gray-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Users size={14} />
        <span>{fileName}</span>
        <span className="mx-1">:</span>
        <span className="font-medium">{users.length > 0 ? `${users.length}명` : "없음"}</span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-gray-800 rounded-md shadow-lg border border-gray-700 p-2 z-10 text-white">
          <div className="text-xs font-medium mb-2 px-2 flex items-center gap-2 text-gray-300">
            <FileText size={14} />
            <span>현재 파일: {fileName}</span>
          </div>
          
          <div className="border-t border-gray-700 pt-2">
            {users.length > 0 ? (
              <ul>
                {users.map((user, idx) => {
                  const userColor = getUserColor(user);
                  return (
                    <li key={idx} className="px-2 py-2 text-sm hover:bg-gray-700 rounded flex items-center group transition-colors">
                      <div 
                        className="w-3 h-3 rounded-full mr-3" 
                        style={{ backgroundColor: userColor }}
                      ></div>
                      <span>{user}</span>
                      <div 
                        className="ml-auto w-2 h-2 rounded-full bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="온라인"
                      ></div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-2 py-2 text-sm text-gray-400 italic">편집 중인 사용자 없음</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorUserList;