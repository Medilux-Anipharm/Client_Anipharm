# Multi-stage build for Expo web app
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# Expo 웹 빌드 실행
RUN npx expo export:web

# Production stage with nginx
FROM nginx:alpine

# 빌드된 파일을 nginx로 복사
COPY --from=builder /app/web-build /usr/share/nginx/html

# nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]
