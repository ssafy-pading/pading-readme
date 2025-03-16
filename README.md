<img src="./docs/pading_logo.png"><br>

> C202 Pading 공통 PJT 우수상/ 웹기술 Track<br/>
> 2025.01.06 ~ 2024.02.21 (7주)<br/>
> 🔗 **[Paing](https://pair-coding.site/) 바로가기<br/>**

### 📌 Contents
 1. [Overview](#Overview)
 2. [기능 소개](#기능-소개)
 3. [기술 스택](#기술-스택)
 4. [주요 기술](주요-기술)
 5. [시스템 아키텍처](#시스템-아키텍처)
 5. [산출물](#산출물)
 6. [팀원 소개](#팀원-소개)

## Overview
🗣 기존의 페어 프로그래밍 방식, 너무 불편하지 않나요?
한 명이 코딩하고, 다른 한 명이 지켜보는 방식은 비효율적일 때가 많죠.

💻 각자의 컴퓨터에서 동시에 코딩하며 실시간 공동 편집!
🚀 코드 수정 즉시 반영! 자동 배포로 더 빠르게!
🤝 원격 환경에서도 원활한 협업, 생산성 극대화!

페어 프로그래밍을 더 편리하고 효율적으로!
이제 **PADING**과 함께 새로운 개발 경험을 시작하세요! 🚀

## 기능 소개

### ✔ 회원가입 & 로그인
- 아바타 생성, 영단어 레벨 테스트, 관심 분야 설정

<img src="./resources/gif/main/회원가입.gif" alt="회원가입" width="800"><br/><br/>

### ✔ 튜토리얼
- 각 컨텐츠에 대한 사용법 제공

<img src="./resources/gif/main/튜토리얼.gif" alt="튜토리얼" width="800"><br/><br/>

### ✔ 메인 페이지 (HOME)
- `Today's Top 10` : 오늘의 탑 10 뉴스
- 이번 달 학습 현황, 뉴스 읽기 기록에 따른 관심도 그래프 표시
- `포인트왕/다독왕` 실시간 랭킹 표시

<img src="./resources/gif/main/메인페이지.gif" alt="메인페이지" width="800"><br/><br/>

### ✔ 라이트/다크모드
- 모드 전환 가능

<img src="./resources/gif/main/다크모드토글.gif" alt="다크모드토글" width="800"><br/><br/>



### ✔ 뉴스 페이지
#### 뉴스 전체 목록
- `하이브리드 추천 시스템`에 따른 뉴스 컨텐츠 추천
- 관심 카테고리 기반 뉴스 컨텐츠 추천
- 최신 전체 뉴스 목록 제공

<img src="./resources/gif/news/뉴스목록.gif" alt="뉴스목록" width="800"><br/>

#### 뉴스 상세
- 한/영 토글을 통해 번역본 제공

<img src="./resources/gif/news/뉴스상세.gif" alt="뉴스상세" width="800"><br/>

- `scroll progress bar`를 통해 뉴스 읽음 처리
- 다 읽은 뉴스에 대해 난이도에 맞는 메달 획득

<img src="./resources/gif/news/뉴스읽음메달.gif" alt="뉴스읽음메달" width="800"><br/>

- 본인 레벨 수준에 맞는 난이도 번역본 기본 제공
- 원하는 난이도로 변경 가능

<img src="./resources/gif/news/뉴스상세난이도토글.gif" alt="뉴스상세난이도토글" width="800"><br/>

#### 단어 하이라이팅
- 모르는 단어에 드래그/더블클릭을 통해 `하이라이팅`
- 하이라이팅한 단어에 대한 뜻과 발음 제공

<img src="./resources/gif/word/단어하이라이팅및취소.gif" alt="단어하이라이팅및취소" width="800"><br/>

#### 뉴스 스크랩
- 읽고 있는 뉴스에 대해 원하는 난이도를 선택하여 스크랩 가능

<img src="./resources/gif/news/뉴스스크랩.gif" alt="뉴스스크랩" width="800"><br/>

#### Word hunt game
- 가로/세로 단어를 맞히는 `word hunt game` 기능
- 뉴스 본문의 단어들 중 랜덤으로 추출된 단어 등장
- 다 맞힌 경우, 경험치 획득

<img src="./resources/gif/news/워드헌트풀기.gif" alt="워드헌트풀기" width="800"><br/>

- 정답 확인 가능

<img src="./resources/gif/news/워드헌트정답보기.gif" alt="워드헌트정답보기" width="800"><br/>



### ✔ 나만의 단어장
#### 단어 목록
- 저장한 단어에 대해 뜻, 예문, 뉴스원문 제공

<img src="./resources/gif/word/단어장.gif" alt="단어장" width="800"><br/>

#### 단어 외움 처리
- 암기한 단어는 `drag & drop`으로 외움 처리

<img src="./resources/gif/word/단어외움처리.gif" alt="단어외움처리" width="800"><br/>

#### 망각 곡선 기반 단어 복습
- `에빙하우스의 망각 곡선 이론`을 바탕으로 한 효율적인 복습 시스템
- 암기한 단어에 대해 1일, 3일, 7일, 30일 등 점진적으로 `복습 퀴즈` 제공

<img src="./resources/gif/study/망각곡선팝퀴즈.gif" alt="망각곡선팝퀴즈" width="800"><br/>


### ✔ 학습 목표 및 경험치
#### 학습 목표 설정
- `뉴스 읽기 횟수`, `단어 테스트로 암기한 단어 수`, `발음 테스트 점수 총합`에 대해 원하는 학습 목표 설정
- 매월 1일 자동으로 목표가 초기화되어, 새로운 달의 목표를 설정 가능

<img src="./resources/gif/study/학습목표설정.gif" alt="학습목표설정" width="800"><br/>

#### 경험치 획득
- 설정한 학습 목표에 따라, 달성 시 경험치 획득 모달 표시

<img src="./resources/gif/study/학습목표달성경험치모달.gif" alt="학습목표달성경험치모달" width="800"><br/>


### ✔ 단어 빈칸 테스트
#### 테스트 시작
- `나의 단어장에 저장된 단어들` 기반으로 원하는 문제 갯수만큼 테스트 응시
- 이전에 진행한 테스트 결과 및 통계 그래프 확인 가능

<img src="./resources/gif/word/단어테스트.gif" alt="단어테스트" width="800"><br/>

#### 테스트 결과
- 응시한 테스트의 상세 결과 확인 가능

<img src="./resources/gif/word/단어테스트결과.gif" alt="단어테스트결과" width="800"><br/>


### ✔ 발음 테스트
#### 테스트 시작
- `나의 단어장에 저장된 단어들의 예문`을 기반으로 테스트 응시
- 녹음 진행 시, STT로 현재 발화에 대해 인식된 문장을 표시
- 이전에 진행한 테스트 결과 및 통계 그래프 확인 가능

<img src="./resources/gif/study/발음테스트.gif" alt="발음테스트" width="800"><br/>

#### 테스트 결과
- `azure speech service` 기반의 정확도, 능숙도, 운율, 단어 완전성 등 `발음 평가 점수` 제공
- 테스트 답안 및 제출한 녹음본 다시 듣기 제공

<img src="./resources/gif/study/발음테스트결과.gif" alt="발음테스트결과" width="800"><br/>


### ✔ 검색 페이지
#### Wordcloud 기반 인기 키워드 검색
- `Elasticsearch` 통한 검색 최적화
- 뉴스 빈출 키워드 기반의 `Wordcloud` 제공

<img src="./resources/gif/main/검색.gif" alt="" width="800"><br/><br/>

### ✔ 마이페이지
- 내 정보, 학습 대시보드(수치, 그래프, 활동량), 스크랩한 뉴스 목록 제공

<img src="./resources/gif/main/마이페이지.gif" alt="" width="800"><br/><br/>


### ✔ PWA (Progressive Web Apps)
|메인 페이지|나만의 단어장|마이 페이지|
|:---:|:---:|:---:|
 <img src="./resources/gif/pwa/MobileMainpage.gif" width="100%"/>|<img src="./resources/gif/pwa/MobileVocapage.gif" width="100%"/>|<img src="./resources/gif/pwa/MobileMypage.gif" width="100%"/>|
 
|뉴스 전체 목록|뉴스 상세|
|:---:|:---:|
 <img src="./resources/gif/pwa/MobileNewsList.gif" width="90%"/>|<img src="./resources/gif/pwa/MobileNewsDetail.gif" width="90%"/>

|단어 빈칸 테스트 시작|단어 빈칸 테스트 진행|단어 빈칸 테스트 결과|
|:---:|:---:|:---:|
 <img src="./resources/gif/pwa/MobileWordStartpage.gif" width="100%"/>|<img src="./resources/gif/pwa/MobileWordTestpage.gif" width="100%"/>|<img src="./resources/gif/pwa/MobileWordTestResultpage.gif" width="100%"/>|

|발음 테스트 시작|발음 테스트 진행|발음 테스트 결과|
|:---:|:---:|:---:|
 <img src="./resources/gif/pwa/MobilePronounceStartpage.gif" width="100%"/>|<img src="./resources/gif/pwa/MobilePronounceTestpage.gif" width="100%"/>|<img src="./resources/gif/pwa/MobilePronounceTestResultpage.gif" width="100%"/>|


## 기술 스택
<img src="./resources/image/development_environment.png" width="80%"><br>

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

