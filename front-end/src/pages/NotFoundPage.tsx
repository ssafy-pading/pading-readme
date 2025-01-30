import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 px-6 text-center">
      <h1 className="text-7xl font-extrabold text-red-600 dark:text-gray-200 animate-pulse">
        404
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        페이지를 찾을 수 없습니다.
      </p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
        주소가 잘못되었거나, 페이지가 삭제되었을 수 있습니다.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white text-lg font-medium rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300"
      >
        홈으로 돌아가기
      </Link>
      <div className="mt-10 text-gray-400 dark:text-gray-500 text-sm">
        ⬅ 돌아가기 전, 주소를 한 번 더 확인해 주세요.
      </div>
    </div>
  );
}
