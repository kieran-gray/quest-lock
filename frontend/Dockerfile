# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:20 AS build-stage

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY ./ /app/

ARG VITE_API_URL=${VITE_API_URL}
ARG VITE_POST_LOGOUT_REDIRECT=${VITE_POST_LOGOUT_REDIRECT}

RUN npm run build

# Stage 1, based on alpine, to have only the compiled app, ready for production with Nginx
FROM alpine

RUN apk add brotli nginx nginx-mod-http-brotli

COPY --from=build-stage /app/dist/ /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/http.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
