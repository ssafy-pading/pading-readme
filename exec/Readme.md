
# 🚀 산출물5. 포팅 매뉴얼


## 1. Gitlab 소스 클론 이후 빌드 및 배포할 수 있도록 정리한 문서

---


1) 사용한 JVM, 웹서버, WAS 제품 등의 종류와 설정 값, 버전(IDE 버전 포함)

- **Java 17**
- **Nginx 1.18**
- **Java 17**
- **SpringBoot 3.4.1**
- **Gradle 8.11**
- **Microk8s 1.29.13**
- **IntelliJ IDEA 2024.3.1.1**


- **NodeJS 22.12.0**
- **React 18.3.1**
- **Vite 6.0.5**
- **Typescript 5.6.2**

---

2) 빌드 시 사용되는 환경 변수 등의 내용 상세 기재

- Backend 환경 변수
  - 경로: `/back-end/src/main/resources/application.yml`
  - ```
    app:
      domain: $SERVICE_DOMAIN
      login-redirect-domain: https://$SERVICE_DOMAIN
    
    server:
      port: 8080
    
    spring:
      servlet:
        multipart:
          max-file-size: 100MB
          max-request-size: 200MB
    
      datasource:
        driver-class-name: com.mysql.cj.jdbc.Driver
        url: jdbc:mysql://$MYSQL_HOST:$MYSQL_PORT/$MYSQL_DATABASE?serverTimezone=Asia/Seoul
        username: $MYSQL_USER
        password: $MYSQL_PASSWORD
    
      jpa:
        database: mysql
        database-platform: org.hibernate.dialect.MySQLDialect
        show-sql: false
        hibernate:
          ddl-auto: none
        properties:
          hibernate:
            format_sql: true
    
      data:
        redis:
          host: $REDIS_HOST
          port: $REDIS_PORT
    
        mongodb:
          uri: mongodb://$MONGODB_USER:$MONGODB_PASSWORD@$MONGODB_HOST:$MONGODB_PORT/?authSource=admin&authMechanism=SCRAM-SHA-1
          database: $MONGODB_DATABASE
    
      jackson:
        time-zone: Asia/Seoul  # Jackson을 통해 MongoDB로 전송될 시간대 설정
    
      security:
        oauth2:
          client:
            registration:
              google:
                clientId: $GOOGLE_LOGIN_API_CLIENT_ID
                clientSecret: $GOOGLE_LOGIN_API_CLIENT_SECRET
                redirect-uri: https://api.pair-coding.site/login/oauth2/code/google
                scope:
                  - email
                  - profile
              kakao:
                client-authentication-method: client_secret_post
                client-name: kakao
                client-id: $KAKAO_LOGIN_API_CLIENT_ID
                client-secret: $KAKAO_LOGIN_API_CLIENT_SECRET
                authorization-grant-type: authorization_code
                provider: kakao
                redirect-uri: https://api.pair-coding.site/login/oauth2/code/kakao
                scope:
              naver:
                client-id: $NAVER_LOGIN_API_CLIENT_ID
                client-secret: $NAVER_LOGIN_API_CLIENT_SECRET
                redirect-uri: https://api.pair-coding.site/login/oauth2/code/naver
                client-name: Naver
                authorization-grant-type: authorization_code
                scope:
            provider:
              kakao:
                authorization-uri: https://kauth.kakao.com/oauth/authorize
                token-uri: https://kauth.kakao.com/oauth/token
                user-info-uri: https://kapi.kakao.com/v2/user/me
                user-name-attribute: id
              naver:
                authorization_uri: https://nid.naver.com/oauth2.0/authorize
                token_uri: https://nid.naver.com/oauth2.0/token
                user-info-uri: https://openapi.naver.com/v1/nid/me
                user_name_attribute: response
    
    kubernetes:
      master-url: https://$K8S_HOST:$K8S_PORT
      token: $K8S_TOKEN
      trust-cert: true
      image-registry: $AWS_ECR_REGISTRY
      namespace: $K8S_NAMESPACE
      env-label: prod
      nodeport:
        min: 30200
        max: 30300
    
    ssh:
      nginx-server:
        host: $NGINX_SERVER_HOST
        port: $NGINX_SERVER_PORT
        user: $NGINX_SERVER_USER
        password: $NGINX_SERVER_PASSWORD
        subdomain-prefix: deploy-
    
    jwt:
      token:
        secret-key: $JWT_SECRET_KEY
        access-expire-time: 1800  # 액세스 토큰 만료 시간 (30분, 밀리초 단위)
        refresh-expire-time: 1209600  # 리프레시 토큰 만료 시간 (14일, 밀리초 단위)
    
    link:
      expire-time: 1800  # 링크 만료 시간 (30분, 밀리초 단위)
    
    livekit:
      api:
        key: $OPENVIDU_KEY
        secret: $OPENVIDU_SECRET
    
    ```
- Frontend 환경 변수
  - 경로: `/front-end/.env`
  - ```
      VITE_APP_API_BASE_URL = $API_SERVER_URL
      VITE_APPLICATION_SERVER_URL = $API_SERVER_URL
      VITE_APP_API_MONITORING_URL = $MONITORING_SERVER_URL
      VITE_LIVEKIT_URL = $OPENVIDU_SERVER_URL
    ```

---

3) 배포 시 특이사항 기재

- 서버 배포 방식
  - SSAFY 제공 Server
    - openVidu 서버 실행
    - 동시 편집  YJS 및 signaling 웹소켓 서버(NodeJS) 설치
  - Backend API Server
    - 홈서버를 이용한 인프라 구축 
      - k8s(Microk8s)와 Nginx를 설치 및 활용
      - k8s를 활용하여 DB 서버 구축 (MySQL / MongoDB / Redis)
  - Frontend 정적 배포
    -  AWS S3와 AWS CloudFront 활용 


- 배포 방법
  - 깃 클론
    - ```
          git clone  https://lab.ssafy.com/s12-webmobile1-sub1/S12P11C202.git
      ```
  - 환경 변수 파일 적용
    - Backend - `/back-end/src/main/resources/application.yml`
    - Frontend - `/front-end/.env`
  - 도커 이미지 빌드
    - ```
          docker build -t $IMAGE_TAG .
      ```
  - 도커 컨테이너 실행
    - ```
      docker run -d -p $DEPLOY_PORT:8080 $IMAGE_TAG
      ```
  - Nginx Config 파일 생성
    - 경로: `/etc/nginx/site-available/$FILE_NAME`
    - ```
      server {
          listen 80;
          server_name api.$SERVICE_DOMAIN;
    
          location / {
          return 301 https://$host$request_uri;  # HTTP에서 HTTPS로 리다이렉트
          }
          }
    
      server {
      listen 443 ssl;
      server_name api.$SERVICE_DOMAIN;
    
          ssl_certificate /etc/letsencrypt/live/$SERVICE_DOMAIN/fullchain.pem;
          ssl_certificate_key /etc/letsencrypt/live/$SERVICE_DOMAIN/privkey.pem;
    
          include /etc/letsencrypt/options-ssl-nginx.conf;  # managed by Certbot
          ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;    # managed by Certbot
    
          # 업로드 파일 크기 제한 설정 (예: 100MB)
          client_max_body_size 100M;
    
          location / {
              proxy_pass http://$SERVER_ID:$DEPLOY_PORT;  # 스프링 서버의 포트
              proxy_set_header Host $host;
              proxy_set_header X-Real-IP $remote_addr;
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
              proxy_set_header X-Forwarded-Proto $scheme;
    
              proxy_set_header Upgrade $http_upgrade;
              proxy_set_header Connection "Upgrade";
          }
      }
      ```
    - Nginx Config 파일 적용
      - `ln -s /etc/nginx/site-available/$FILE_NAME ../site-enable`
      - `service nginx reload`

    
---

4) DB 접속 정보 등 프로젝트(ERD)에 활용되는 주요 계정 및 프로퍼티가 정의된 파일 목록
- Backend 환경 변수 파일 내 접속 정보 참고 
  - 경로: `/back-end/src/main/resources/application.yml`


## 2. 프로젝트에서 사용하는 외부 서비스 정보를 정리한 문서
` 소셜 인증, 포톤 클라우드, 코드 컴파일 등에 활용된 외부 서비스 가입 및 활용에 필요한 정보`

- Infra
  - Gabia: 도메인 발급
  - AWS Elastic Container Registry: 이미지 저장소
  - AWS Certificate Manager: SSL 인증서 발급
  - AWS Rout 53: 도메인 호스팅 연결
  - AWS S3: Frontend 정적 배포 파일 저장
  - AWS CloudFront: Frontend 정적 배포를 위한 CDN 서비스

    
- oAuth2 소셜 로그인
  - Google
  - Kakao
  - Naver


## 3. DB 덤프 파일 최신본
sql 파일 첨부


