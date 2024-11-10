FROM alpine:latest
RUN apk update
RUN apk upgrade
RUN apk add icu-data-full
RUN apk add nodejs npm yarn
WORKDIR /home
COPY . .
RUN yarn install

ENV VITE_HOST=0.0.0.0
ENV VITE_PORT=80
EXPOSE $VITE_PORT
ENTRYPOINT ["yarn", "dev"]

