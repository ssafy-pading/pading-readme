import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import TerminalComponent from '../widgets/projects/ProjectTerminal'
import IdeEditor from '../widgets/projects/IdeEditor';

const TerminalTabs = ({ terminals, activeTab, onTabClick, onDeleteTab }) => {
  return (
    <div className="flex space-x-2 mb-2">
      {terminals.map((_, index) => (
        <div key={index} className="relative">
          <button
            className={`px-4 py-2 rounded ${activeTab === index ? 'bg-blue-500' : 'bg-gray-700'}`}
            onClick={() => onTabClick(index)}
          >
            Terminal {index + 1}
          </button>

          {/* 삭제 버튼 */}
          {terminals.length > 1 && (
            <button
              onClick={() => onDeleteTab(index)}
              className="absolute top-0 right-0 bg-red-500 text-white text-sm px-2 py-1 rounded"
            >
              X
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

function ProjectPage() {
  const [isDarkMode, setIsDarkMode] = useState(false); // 다크모드 상태
  // const [theme, setTheme] = useState("light"); // 테마 상태

  const [terminals, setTerminals] = useState([<TerminalComponent key={0} />]); // 기본 터미널 하나
  const [activeTab, setActiveTab] = useState(0); // 활성화된 탭의 인덱스

  const addNewTerminal = () => {
    setTerminals([
      ...terminals,
      <TerminalComponent key={terminals.length} />
    ]);
    setActiveTab(terminals.length); // 새 터미널을 생성하면 해당 터미널로 활성화
  };

  const handleDeleteTerminal = (index) => {
    // 터미널 삭제
    const newTerminals = terminals.filter((_, i) => i !== index);
    setTerminals(newTerminals);

    // 활성화된 탭이 삭제된 터미널이라면 다른 탭으로 전환
    if (activeTab >= newTerminals.length) {
      setActiveTab(newTerminals.length - 1);
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark'); // 다크모드 활성화
    } else {
      document.documentElement.classList.remove('dark'); // 라이트모드 활성화
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode); // 다크 모드 토글
  };

  // const toggleTheme = () => {
  //   setTheme((prevTheme) => (prevTheme === "light" ? "vs-dark" : "light")); // 테마 토글
  // };

  return (
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-800">
      <Link to="/"> 홈으로 </Link>
      <div className="mt-4 flex justify-between">
        <button
          onClick={toggleDarkMode}
          className="p-2 bg-blue-500 text-white rounded dark:bg-blue-700"
        >
          Toggle Dark Mode
        </button>
        {/* <button
          onClick={toggleTheme}
          className="p-2 bg-green-500 text-white rounded dark:bg-green-700"
        >
          {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        </button> */}
      </div>

      {/*파일 탐색기 + IDE */}
      <div className="mt-8 flex">
        {/* 파일 탐색기 */}
        <div className="w-1/4 bg-gray-200 dark:bg-gray-700 p-4">
          <h3 className="text-lg font-bold">Explorer</h3>
          <ul className="mt-4 space-y-2">
            <li className="text-blue-500 cursor-pointer">index.js</li>
            <li className="text-blue-500 cursor-pointer">App.js</li>
            <li className="text-blue-500 cursor-pointer">style.css</li>
          </ul>
        </div>
        {/* IDE */}
        <div className="flex-1">
          <IdeEditor />
        </div>
      </div>

      {/*터미널 */}
      <div className="p-4">
        {/* 새 터미널 버튼 */}
        <button
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          onClick={addNewTerminal}
        >
          Add New Terminal
        </button>

        {/* 터미널 탭들 */}
        <TerminalTabs
          terminals={terminals}
          activeTab={activeTab}
          onTabClick={setActiveTab}
          onDeleteTab={handleDeleteTerminal}
        />

        {/* 활성화된 터미널 */}
        <div className="mt-8 p-4 bg-gray-900 text-white rounded">

          <h3 className="text-lg font-bold">Terminal {activeTab + 1}</h3>
          {terminals[activeTab]}
        </div>
      </div>
    </div>
  );
}

export default ProjectPage;