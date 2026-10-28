# Multi-stage production Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Use --legacy-peer-deps to resolve React 19 peer dependency graphs without npm Arborist crash
RUN npm install --legacy-peer-deps --no-audit --no-fund

COPY . .
RUN npm run build

# Production runtime stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
