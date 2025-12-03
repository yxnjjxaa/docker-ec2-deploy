# Node.js 18 LTS 버전 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json 복사
COPY package.json ./

# 프로덕션 의존성만 설치 (package-lock.json이 없어도 작동)
RUN npm install --production --omit=dev

# 애플리케이션 소스 복사
COPY app.js .

# Build arguments (GitHub Actions에서 전달)
ARG NODE_ENV=production
ARG PORT=3000
ARG APP_NAME="My Web App"

# 환경변수 설정 (Build args를 환경변수로 변환)
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV APP_NAME=${APP_NAME}

# 포트 노출 (ARG PORT 사용 - 빌드 타임에 평가됨)
EXPOSE ${PORT}

# non-root 사용자로 실행 (보안)
USER node

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# 애플리케이션 실행
CMD ["npm", "start"]
