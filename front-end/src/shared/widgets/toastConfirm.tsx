import { toast } from 'react-hot-toast';
import { AiOutlineWarning } from 'react-icons/ai'; // react-icons 사용

export const confirmToast = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const id = toast.custom(
      (t) => (
        <div
          className={`bg-white p-5 rounded-lg shadow-md border border-red-500 transition-transform duration-500 ${
            t.visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
          }`}
        >
          <div className="flex items-center mb-4">
            <AiOutlineWarning className="text-red-600 w-8 h-8 mr-3 animate-pulse" />
            <h2 className="font-extrabold text-xl">Warning</h2>
          </div>
          <p className="font-semibold text-lg mb-4">{message}</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(false); // 취소 시 false 반환
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              취소
            </button>
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(true); // 확인 시 true 반환
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
            >
              확인
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // 자동 닫힘 없음
      }
    );
  });
};
