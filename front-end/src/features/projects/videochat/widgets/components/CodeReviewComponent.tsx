import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../../app/redux/store';
import { fetchCodeReview } from '../../../../../app/redux/codeSlice';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FiClipboard, FiCheck } from 'react-icons/fi';
import './ChatListComponent.css'; // ✅ 채팅 스타일의 스크롤바 적용

const CodeReviewComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const code = useSelector((state: RootState) => state.code.code);
  const review = useSelector((state: RootState) => state.code.review);
  const status = useSelector((state: RootState) => state.code.status);
  const error = useSelector((state: RootState) => state.code.error);
  const fileName = useSelector((state: RootState) => state.code.fileName);

  const [showError, setShowError] = useState(false);

  const handleReviewClick = () => {
    if (!fileName) {
      setShowError(true);
      return;
    }
    setShowError(false);
    dispatch(fetchCodeReview(code));
  };

  return (
    <div className="flex flex-col h-full bg-[#2d2d2d] text-white">

      {/* 코드 리뷰 결과 영역 */}
      <div className="custom-scrollbar flex-1 overflow-y-auto p-3 flex flex-col space-y-4 relative">
        <p className="sticky">선택된 파일 : {fileName || "없음"}</p>
        {status === 'failed' && error && (
          <p className="text-red-500">에러 발생: {error}</p>
        )}

        {review ? (
          <div className="bg-[#2d2d2d] p-3 rounded-lg text-gray-300 text-sm">
            <h3 className="text-md font-semibold text-gray-300 mb-2">리뷰 결과</h3>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre: ({ children }) => <div className="relative">{children}</div>,
                code: ({ children }) => {
                  const [isCopied, setIsCopied] = useState(false);
                  const codeText = String(children).trim();

                  return (
                    <div className="relative bg-gray-900 text-gray-300 p-2 rounded-md">
                      {/* ✅ 복사 버튼 (투명 배경 + 아이콘) */}
                      <CopyToClipboard text={codeText} onCopy={() => setIsCopied(true)}>
                        <button
                          className="absolute top-2 right-2 text-gray-400 hover:text-white transition"
                          aria-label="Copy Code"
                        >
                          {isCopied ? <FiCheck size={16} /> : <FiClipboard size={16} />}
                        </button>
                      </CopyToClipboard>

                      {/* ✅ 스크롤 가능한 코드 블록 */}
                      <pre className="custom-scrollbar overflow-x-auto max-h-[300px] p-2">
                        {codeText}
                      </pre>
                    </div>
                  );
                },
                p: ({ children }) => <p className="text-gray-200">{children}</p>,
                li: ({ children }) => <li className="ml-4 list-disc">{children}</li>,
                strong: ({ children }) => <strong className="text-yellow-300">{children}</strong>,
              }}
            >
              {review}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-gray-400 text-sm text-center mt-5">
            AI 코드 리뷰 결과가 여기에 표시됩니다.
          </div>
        )}
      </div>

      {/* 파일이 없을 때 경고 메시지 */}
      {showError && (
        <div className="text-red-500 text-xs text-center mb-2">
          AI 코드 리뷰를 요청하려면 파일을 선택해야 합니다.
        </div>
      )}

      {/* 코드 리뷰 요청 버튼 */}
      <div className="bg-[#2d2d2d] w-full h-[50px] flex justify-center items-center border-t border-gray-600">
        <button
          onClick={handleReviewClick}
          disabled={!fileName || status === 'loading'}
          className={`px-4 py-2 text-sm rounded-lg w-5/6 transition ${
            !fileName
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-[#3B82F6] hover:bg-blue-700 text-white'
          }`}
        >
          {status === 'loading' ? '리뷰 중...' : 'AI 코드 리뷰 요청'}
        </button>
      </div>
    </div>
  );
};

export default CodeReviewComponent;
