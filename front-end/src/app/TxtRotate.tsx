import React, { useEffect, useState } from "react";

type TxtRotateProps = {
    texts: string[]; // 회전할 텍스트 배열
    period?: number; // 텍스트 전환 주기 (ms 단위)
    className: string; // 
};

const TxtRotate: React.FC<TxtRotateProps> = ({  texts, period = 2000, className }) => {
  const [text, setText] = useState(""); // 현재 표시 중인 텍스트
  const [isDeleting, setIsDeleting] = useState(false); // 삭제 중인지 여부
  const [loopNum, setLoopNum] = useState(0); // 현재 텍스트 배열의 인덱스
  const [delta, setDelta] = useState(300 - Math.random() * 100); // 다음 업데이트까지의 시간

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % texts.length; // 현재 배열 인덱스
      const fullText = texts[i]; // 현재 표시할 전체 텍스트

      if (isDeleting) {
        // 텍스트 삭제 중일 경우
        setText((prev) => fullText.substring(0, prev.length - 1));
      } else {
        // 텍스트 추가 중일 경우
        setText((prev) => fullText.substring(0, prev.length + 1));
      }

      let nextDelta = 300 - Math.random() * 100; // 기본 타이핑 속도

      if (isDeleting) {
        nextDelta /= 2; // 삭제 속도는 더 빠르게
      }

      if (!isDeleting && text === fullText) {
        // 텍스트 추가가 완료된 경우
        nextDelta = period; // 지정된 주기 동안 대기
        setIsDeleting(true); // 삭제 모드로 전환
      } else if (isDeleting && text === "") {
        // 텍스트 삭제가 완료된 경우
        setIsDeleting(false); // 추가 모드로 전환
        setLoopNum((prev) => prev + 1); // 다음 텍스트로 이동
        nextDelta = 500; // 짧은 대기 시간 후 다음 텍스트 추가 시작
      }

      setDelta(nextDelta);
    };

    const timeout = setTimeout(handleTyping, delta);

    return () => clearTimeout(timeout); // 컴포넌트 언마운트 시 타임아웃 클리어
  }, [text, isDeleting, loopNum, texts, delta, period]);

  return (
    <span className={ className }>
      <span className="wrap">{text}</span>
      <span className="cursor">|</span>
    </span>
  );
};

export default TxtRotate;

// 사용법 예시
// <TxtRotate texts={["강신우", "신입 개발자", "열정적인 개발자"]} period={2000} />
