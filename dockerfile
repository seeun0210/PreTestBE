# # ---- Base Node ----
# FROM node:20-alpine AS base
# WORKDIR /app
# COPY package*.json ./

# # 의존성 설치 단계 제거

# # ---- Copy Files ----
# FROM base AS build
# COPY . .

# # ---- Dev ----
# FROM node:20-alpine AS development
# COPY --from=build /app .
# RUN npm install 
# CMD ["npm", "run", "start:dev"]

# +++++++++++++++++++++ver2

# ---- Base Node ----
# Base Node
FROM node:20-alpine AS base
# WORKDIR /app 이 부분을 제거했습니다. 따라서 모든 파일은 루트 디렉토리에 복사됩니다.
COPY package*.json ./

# 의존성 설치 단계 제거

# Copy Files
FROM base AS build
# 이제 모든 소스 코드를 컨테이너의 루트 디렉토리로 복사합니다.
COPY . .

# Dev
FROM node:20-alpine AS development
# 여기서도 모든 파일은 루트 디렉토리에 위치합니다.
COPY --from=build / .
RUN npm install 
CMD ["npm", "run", "start:dev"]

