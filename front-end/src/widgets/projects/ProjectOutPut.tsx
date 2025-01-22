import { useState } from "react";
import { executeCode } from "./executeapi"


// 실행결과 출력
export const OutPut = ({ editorRef, language }: {
    editorRef: string
    language: string
}) => {
    const [output, setOutput] = useState([]) // 출력 배열
    const [isLoading, setisLoading] = useState(false) // 로딩중 변수
    const [isError, setisError] = useState(false) // 에러 변수

    // 코드 실행 함수
    const runCode = async () => {
        const sourceCode = editorRef.current.getValue();
        if (!sourceCode) {
            return;
        }
        try {
            setisLoading(true) // 로딩 설정
            const { run: result } = await executeCode(language, sourceCode)
            setOutput(result.output.split('\n'))

            // stderr : standard error 표준오류를 나타내는 스트림
            result.stderr ? setisError(true) : setisError(false)
        } catch (error) { }
        finally {
            setisLoading(false) // 로딩 중지
        }
    }

    return (
        <div>
            {isLoading ? // 코드 실행 버튼
                "로딩딩동중" :
                <button
                    className="bg-blue-500 text-white rounded-lg"
                    onClick={runCode}>
                    Run Code
                </button>}

            {/*실행 결과 출력창 */}
            <div className="bg-slate-600"> 
                <h1>OutPut</h1>
                <div
                    className={`${isError ? "text-red-500" : "text-white"} border`}
                    style={{ height: "300px", width: "100%" }}>
                    {output ? output.map((line, i) => (
                        <div key={i}>{line}</div> // 각 줄을 <div>로 출력
                    ))
                        : "Click Run Code"}
                </div>
            </div>
        </div>
    )
}

