<img src="./docs/pading_logo.png"><br>

> C202 Pading 공통 PJT 우수상/ 웹기술 Track<br/>
> 2025.01.06 ~ 2024.02.21 (7주)<br/>
> 🔗 **[Paing](https://pair-coding.site/) 바로가기<br/>**

### 📌 Contents
- [Overview](#overview)
- [기능 소개](#기능-소개)
  - [✔ 매니징 시스템](#-매니징-시스템)
  - [✔ 공동 편집 IDE](#-공동-편집-ide)
- [기술 스택](#기술-스택)
  - [✔ 프론트엔드 기술 스택](#-프론트엔드-기술-스택)
- [주요 기술](#주요-기술)
- [시스템 아키텍처](#시스템-아키텍처)
- [산출물](#산출물)
- [팀원 소개](#팀원-소개)
    - [🔥 Pading](#-pading)

## Overview
🗣 기존의 페어 프로그래밍 방식, 너무 불편하지 않나요?
한 명이 코딩하고, 다른 한 명이 지켜보는 방식은 비효율적일 때가 많죠.

💻 각자의 컴퓨터에서 동시에 코딩하며 실시간 공동 편집!
🚀 코드 수정 즉시 반영! 자동 배포로 더 빠르게!
🤝 원격 환경에서도 원활한 협업, 생산성 극대화!

페어 프로그래밍을 더 편리하고 효율적으로!
이제 **PADING**과 함께 새로운 개발 경험을 시작하세요! 🚀

## 기능 소개
### ✔ 매니징 시스템
- **매니징 시스템**: 오너, 매니저, 멤버로 구성
- **그룹 및 프로젝트 관리**
  - 오너: 그룹 생성 및 구성원 역할 변경
  - 매니저: 프로젝트 생성 및 관리
  - 멤버: 프로젝트 참여 가능
- **호출 기능**: 프로젝트 내에서 오너 혹은 매니저 호출 가능
### ✔ 공동 편집 IDE
- **에디터**: 
  - **Monaco Editor** + **Yjs**를 활용하여 실시간 공동 편집 구현
  - WebSocket 기반 시그널링 서버를 구축하여 다중 사용자 동기화
- **터미널**:
  - **Xterm.js**를 사용하여 터미널 환경 구현
  - **STOMP.js** 및 **SockJS**를 활용하여 각 프로젝트 컨테이너와 실시간 통신


## 기술 스택
### ✔ 프론트엔드 기술 스택
- **TypeScript + React** 기반
- **Tailwind CSS**를 활용한 UI 스타일링
- **Vite**를 빌드 툴로 사용하여 빠른 개발 환경 구축
PADING과 함께 더 빠르고 편리한 페어 프로그래밍 환경을 만들어보세요! 🚀


## 주요 기술
- **데이터 파이프라인 구축**
  - 각 데이터베이스의 특성을 고려한 멀티 데이터베이스 아키텍처 설계<br/>
  - 대용량 데이터 백업을 위한 효율적인 아키텍처 설계<br/>
  - APScheduler를 활용한 데이터 수집 프로세스 자동화<br/>
  <img src="./resources/image/data_pipeline.png" width="800">
  
- **하이브리드 추천 시스템**
  - **Cold Start 문제 해결**을 위한 협업 필터링(CF) 및 컨텐츠 기반 필터링(CBF) 결합<br/>
  - 사용자 행동 데이터 기반 유사도 계산<br/>
  - KoNLPy 기반 형태소 분석 및 TF-IDF 매트릭스 구축<br/>
  <img src="./resources/image/hybrid_recommendation.png" width="800">

- **Elasticsearch 기반 검색**
  - 뉴스 기사 검색 기능 최적화<br/>
  - 역 인덱스 활용한 데이터 처리 및 검색 기능 제공<br/>
  <img src="./resources/image/elasticsearch_Jmeter.png" width="800">

## 시스템 아키텍처
- **Blue/Green 무중단 배포 전략**
  - 애플리케이션의 두 개의 환경(Blue와 Green)을 활용하여 서비스의 가용성과 안정성을 높이는 배포 방식<br/>
  <img src="./resources/image/system_architecture.png" width="800"><br>

## 산출물
| 종류 | 바로가기 |
| --- | --- |
| API 명세서 | [📡 API 명세서](https://aback-mandolin-01e.notion.site/API-96e24c73ae4f43ff8ce1cdf464d804f7) |
| 와이어 프레임 | [🎨 와이어 프레임](https://www.figma.com/design/dgzYzuJbAeYHOXEp3LYs8M/%ED%99%94%EB%A9%B4-%EC%84%A4%EA%B3%84?node-id=0-1&p=f&t=HkpWcjM3jrOzOSsT-0) |
| E-R Diagram | [🖥️ E-R Diagram](https://www.erdcloud.com/d/Q75Bv3GSFP2C6mu8F) 
| 최종 발표 자료 | [📊 최종 발표 자료](./docs/C202_공통프로젝트_발표.pdf) | |


## 팀원 소개
#### 🔥 Pading

|**[👑허인주/BE](https://github.com/jjonior)**|**[박재형/BE](https://github.com/arnold714)**|**[강안수/FE](https://github.com/kangansoo)**|**[신희원/FE](https://github.com/heewon0107)**|**[이준익/FE](https://github.com/juniqu-e)**|**[강신우/FE](https://github.com/sinukang)** |
| :---------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------: |
| <img src="https://avatars.githubusercontent.com/u/121348399?v=4" width="800"> | <img src="https://avatars.githubusercontent.com/u/116993794?v=4" width="800"> | <img src="https://avatars.githubusercontent.com/u/137989190?v=4" width="800"> | <img src="https://avatars.githubusercontent.com/u/175683567?v=4" width="800"> | <img src="https://avatars.githubusercontent.com/u/175383065?v=4" width="800"> | <img src="https://avatars.githubusercontent.com/u/108846424?v=4" width="800"> |

