# This is for prod environment
# Stage 1: Build
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Static output container
FROM nginx:alpine
# 1. Copy the build output
COPY --from=build /app/dist /usr/share/nginx/html

# 2. Copy your NEW custom SPA config 
# Overwriting the default.conf is the standard way to apply your logic
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
