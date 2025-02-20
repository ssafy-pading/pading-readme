import React, { useEffect, useState } from "react";

type TxtRotateProps = {
    texts: string[]; // 회전할 텍스트 배열
    period?: number; // 텍스트 전환 주기 (ms 단위)
    className: string; //
    singleLoop?: boolean; // 첫 번째 단어만 표시하고 삭제 안 함
    speedMultiplier?: number; // 타이핑 속도 배속 (기본값: 1, 최소 0, 최대 3)
};

const TxtRotate: React.FC<TxtRotateProps> = ({ texts, period = 2000, className, singleLoop = false, speedMultiplier = 1 }) => {
  const [text, setText] = useState(""); // 현재 표시 중인 텍스트
  const [isDeleting, setIsDeleting] = useState(false); // 삭제 중인지 여부
  const [loopNum, setLoopNum] = useState(0); // 현재 텍스트 배열의 인덱스
  const [delta, setDelta] = useState(301 - (Math.random() * 100 * Math.min(3, Math.max(0, speedMultiplier)))); // 다음 업데이트까지의 시간
  const [blink, setBlink] = useState(false); // 커서 깜빡임 상태

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % texts.length; // 현재 배열 인덱스
      const fullText = texts[i]; // 현재 표시할 전체 텍스트

      if (isDeleting) {
        setText((prev) => fullText.substring(0, prev.length - 1));
      } else {
        setText((prev) => fullText.substring(0, prev.length + 1));
      }

      let nextDelta = (301 - Math.random() * 100) / Math.min(3, Math.max(0, speedMultiplier));

      if (isDeleting) {
        nextDelta /= 2;
      }

      if (!isDeleting && text === fullText) {
        setBlink(true);
        if (singleLoop) return;
        nextDelta = period;
        setTimeout(() => setBlink(false), period - 500); // 삭제 전 대기 시간 동안 깜빡임 추가
        setIsDeleting(true);
      } else if (isDeleting && text === "") {
        setBlink(true);
        setIsDeleting(false);
        setLoopNum((prev) => prev + 1);
        nextDelta = 500;
        setTimeout(() => setBlink(false), 500); // 삭제 완료 후에도 깜빡임 유지
      }

      setDelta(nextDelta);
    };

    const timeout = setTimeout(handleTyping, delta);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, loopNum, texts, delta, period, singleLoop, speedMultiplier]);

  useEffect(() => {
    if (singleLoop || (isDeleting && text === "") || (!isDeleting && text === texts[loopNum % texts.length])) {
      const blinkInterval = setInterval(() => setBlink((prev) => !prev), 500);
      return () => clearInterval(blinkInterval);
    }
  }, [singleLoop, isDeleting, text, loopNum, texts]);

  return (
    <span className={className}>
      <span className="wrap">{text}</span>
      <span className="cursor" style={{ opacity: blink ? 0 : 1 }}>|</span>
    </span>
  );
};

export default TxtRotate;
