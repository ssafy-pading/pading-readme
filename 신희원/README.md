# 학습 기록
## 목차
1. [1일차 01-13 학습 목표](#1일차-01-13-학습-목표)
2. [2일차 01-14 학습 목표](#2일차-01-14-학습-목표)
## 기술 스택
1. React
2. Typescript
3. Talewind
4. WebRTC

## 1일차 학습 01-13


### 목표 
- React를 사용하여 사용자 인터페이스(UI)를 구현합니다.
- Redux를 사용하여 애플리케이션의 상태를 전역적으로 관리합니다.
- 사용자가 Create, Read, Update, Delete 작업을 할 수 있도록 합니다.

## 2일차 학습 01-14

### 목표
WebRTC를 사용한 협업 툴 생성

#### 코드 미러 라이브러리 사용
```javascript
import React, { useEffect } from 'react';
import * as Y from 'yjs';
import { CodemirrorBinding } from 'y-codemirror';
import { WebrtcProvider } from 'y-webrtc';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'; // JavaScript 모드 불러오기


function App() {
  useEffect(() => {
    // Yjs 문서와 관련된 설정
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider('codemirror-demo-room', ydoc); // 'codemirror-demo-room' 이름의 방으로 연결
    const yText = ydoc.getText('codemirror'); // 공유할 텍스트 객체
    const yUndoManager = new Y.UndoManager(yText); // Undo/Redo 관리

    // CodeMirror 편집기 설정
    const editorDiv = document.getElementById('editor'); // HTML 요소에 CodeMirror를 붙일 div를 지정
    const editor = CodeMirror(editorDiv, {
      mode: 'javascript',
      lineNumbers: true,
      value: '// 여기에 코드를 작성하세요.\n', // 초기 코드
    });

    // Yjs와 CodeMirror 바인딩
    const binding = new CodemirrorBinding(yText, editor, provider.awareness, { yUndoManager });

    // 컴포넌트가 언마운트될 때 클린업
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, []); // 빈 배열을 넣어 컴포넌트가 처음 마운트될 때만 실행되도록 설정

  return (
    <div>
      <h1>실시간 협업 편집기 (CodeMirror & Yjs)</h1>
      {/* CodeMirror가 표시될 입력창 */}
      <div id="editor" style={{ height: '400px' }}>
        {editorRef.current}
      </div>
    </div>
  );
}

export default App;
```

### 결과
![alt text](image.png)

### 고찰
한 기기에서는 페어프로그램이 되지만 배포 후 다른 기기에서 되질 않는다.

### 내일 목표
WebRTC와 WebSocket의 정리를 하고 각 기기에서 연동이 되도록 해야겠다.
목차 만들기기

## 3일차 학습 01-15

### 목표
Typescript 학습

### 학습 내용 정리리
- 사용 이유
    1. 가독성과 유지보수성 향상
    2. **명시적인 에러 로그**

---

# 설치방법

1. node.js 설치(최신버전)
2. VScode 에디터 준비
3. 터미널 오픈
    
    ```powershell
    npm install -g typescript
    ```
    
4. tsconfig.json
    
    ```json
    {   
      "compilerOptions" : {     
        "target": "es5",     
        "module": "commonjs",  
      } 
    }
    ```
    
    
5. 타입스크립트 > 자바스크립트 변환(컴파일)
    
    ```powershell
    tsc -w
    ```
    
    

# 필수 문법

1. 변수 타입 지정
    
    ```tsx
    
    const 이름 :string = "shin";
    let 이름 :string[] = ["shin", "kim"]; 
    let 이름 :{name : string} = {name: "shin"}; 
    
    let 이름 :{name? : string} = {name: "shin"}; 
    name은 옵션이다.
    
    let 이름 :string | number = 123;
    UnionType
    ```
    
    
    
2. 타입 지정
    
    ```tsx
    type MyType = String | number;
    
    let myName :MyType = 1;
    ```
    
3. 함수에 타입 지정
    
    ```tsx
    function temp(x:number) {
        return x * 2;
    }
    
    리턴할 타입도 지
    function temp(x:number) :number {
        return x * 2;
    }
    ```
    
4. array에 쓸 수 있는 tuple 타입
    
    ```tsx
    type Member = [number, boolean]
    let john :Member = [123, false]
    순서 지켜야 됌.
    ```
    
5. 오브젝트 속성 지정
    
    ```tsx
    type Member = {
        [key : string] : string
    }
    // [key : string] 모든 오브젝트 속성
    
    let join :Member = {
        key : "h",
        hi : "gd"
    }
    ```
    

---

# 1. 타입스크립트

- JavaScript와의 비교
    - **엄격한 문법을 사용**
    - **버그 발생 가능성 낮음**
    - **안정적임**
        

- JavaScript의 한계점과 TypeScript
    
    

- 타입스크립트의 동작 원리
    
    
    
- Hello TS World!
    
    ```bash
    npm init
    ```
    
    - npm init(노드 초기화)
        - 실행 결과
        
        
    - 패키지 설치
        - node.js가 제공하는 내장 기능들에 대한 타입 정보를 가진 패키지 설치
            
            ```bash
            npm i @types/node
            ```
            
        - 결과
            
    - 타입스크립트 컴파일러 설치
        
        ```bash
        npm install typescript -g 
        -g : global 컴퓨터 전체에 설치한다.
        ```
        
    - 컴파일러 명령어
        
        ```bash
        버전확인
        tsc -v 
        
        컴파일하기
        tsc src/index.ts
        ```
        
    - tsx (컴파일과 동시에 실행) (ts + node)
        
        ```bash
        npm i -g tsx
        ```
        

- 타입스크립트 컴파일러 옵션 설정하기
    - 컴파일러 옵션
        - 얼마나 엄격하게 타입 오류를 검사할지
        - 자바스크립트 코드의 버전은 어떻게 할지
    - init 초기화
        
        ```bash
        tsc --init
        ```
        
        - TypeScript 컴파일러 설정 파일 생성
            
            
            tsconfig : TypeScriptConfiguration
            
    - include
        - 특정 폴더 아래 모든 파일 동시 컴파일
        
        ```json
        {
          "include": ["src"]
        }
        ```
        
    - target
        - 컴파일해서 만들어지는 JavaScript의 버전 설정
        
        ```json
        "compilerOptions": {
            "target": "ESNext",
            "module": "ESNext",
            "outDir": "dist",
            "strict": true,
            "strictNullChecks": false, // Null check 비활성
            "moduleDetection": "force",
        
          }
          
         
         ESNext : 최신 버전
        ```
        
    - module
        - 모듈 시스템 설정
    - outDir
        - 컴파일된 자바스크립트 파일의 위치 설정
            
            
    - strict
        - 엄격한 검사
        - 보통 true 설정해서 오류 가능성을 줄임
    - moduleDetection
        - 각각의 파일을 어떤 모듈로 감지할 것을 결정함
        - TypeScript는 ts파일을 전역 모듈로 본다.
            - 한 공간에 있는 코드로 친다.
                - 다른 해결법 : export 사용
                    
                    ```json
                    const a = 1;
                    
                    export {};
                    ```
                    
    - 부록
        
        

---

# 2. 타입스크립트 기본


- 원시타입과 리터럴 타입
    
    
    ```tsx
    let name :string = "heewon";
    :string > 타입 어노테이션
    ```
    
    - 리터럴 타입 (리터럴 = 값)
        - 값으로 만든 타입
        
        ```tsx
        let num : 10 = 10;
        
        ```
        
    
- 배열과 튜플
    - 튜플을 사용할 때
        - 인덱스의 순서가 중요할 때
    
    ```tsx
    let 이름 :string[] = ["shin", "kim"]; 
    
    // 다양한 타입의 배열
    let multiArr : (number | string) = ["hi", 1]
    
    // 다차원 배열
    let doubleArr : number[][] = [[1,2], [2,3,4]]
    
    // 튜플
    // 길이와 타입이 고정된 배열
    let tup1: [number, number] = [1,2];
    ```
    

- 객체
    
    ```tsx
    let user: {
    	id?: number,
    	readonly name: string // readonly를 사용하면 읽기전용으로 user.name = "원희신" X
    	} = {
    	id: 1,
    	name: "신희원"
    	};
    
    ?는 id가 선택 요소임을 의미
    ```
    

- 타입 별칭과 인덱스 시그니처
    - 타입 별칭
        
        ```tsx
        type User = {
        	id: number;
        	name: string;
        	}
        ```
        
    - 인덱스 시그니처
        
        ```tsx
        type Country = {
        	[key: string]: string;
        }
        
        let countryCodes = {
        	Korea : "ko",
        	Us : "us",
        	}
        ```
        
    
- 열거형 타입 Enumerable Type
    
    ```tsx
    // enum 타입
    // 여러가지 값들에 각각 이름을 부여해 열거해두고 사용하는 타입
    
    enum Role {
    	ADMIN = 10, // 숫자 할당을 하지않아도 순서대로 할당됨.
    	USER, // 11
    }
    
    enum Language {
    	korean = "ko",
    	english = "en"
    }
    
    const user1 = {
    	name : "희원",
    	role : Role.ADMIN, // 0 <- 관리자
    	language : Language.korean
    }
    
    const user2 = {
    	name : "원희",
    	role : Role.USER // 1 <- 일반 유저
    }
    ```
    

- Any와 Unknown
    - Any
        
        ```tsx
        // 특정 변수의 타입을 확실히 모를 때
        
        let anyVar: any = 10;
        anyVar = "anyType"
        
        let num: number = 15;
        num = anyVar; // 대입가능
        ```
        
    - **Unknown (선호)**
        
        ```tsx
        let unknownVar: unknown;
        num = unknownVar // 대입불가능 
        
        ```
        

- Void와 Never타입
    - Void
        
        ```tsx
        // void -> 공허
        // 아무것도 없음을 의미하는 타입
        
        function func1(): string {
        }
        
        function func2(): void {
        	
        }
        
        let a: void;
        
        a = undefined;
        
        ```
        
    - Never
        
        ```tsx
        // 불가능한 타입
        // 반환값이 있는게 모순일 때
        function func3 (): never {
        	while (true) {}
        }
        
        function func4 (): never {
        	throw new Error();
        }
        ```

### 고찰
TypeScript의 현재 트렌드와 사용 이유에 대해 알게됐다.
대규모 프로젝트에서 버그 가능성을 낮추는 기술을 배웠다. 

### 내일 학습 목표
1. 함수와 타입문법
2. 인터페이스
3. 클래스
4. 제네릭
