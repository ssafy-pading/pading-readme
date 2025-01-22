// 언어 버전 종류
const LANGUAGE_VERSIONS: {
    javascript: string
    typescript: string
    python: string
    java: string
    csharp: string
    php: string
} =
{
    javascript: "18.15.0",
    typescript: "5.0.3",
    python: "3.10.0",
    java: "15.0.2",
    csharp: "6.12.0",
    php: "8.2.3",
}

// 객체를 리스트로 변환
const languages = Object.entries(LANGUAGE_VERSIONS)

// 언어 선택 셀렉터터
export const LanguageSelector = ({language, onSelect}: {
    language: string
    onSelect: any 
}) => {
    // 언어 선택 시 상태 업데이트
    const handleLanguageChange = (event: any) => {        
      onSelect(event.target.value)
    };
  
    return (
      <div>
        <select
          id="language-select"
          value={language}
          onChange={handleLanguageChange}
        >
          {languages.map(([language]) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
      </div>
    );
}
