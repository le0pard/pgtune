FROM alpine:3 AS builder
WORKDIR /code
COPY . /code/
RUN apk --no-cache add nodejs ruby-dev build-base git yarn \
  &&  gem install --no-document middleman
RUN yarn install --immutable \
  && yarn run lint \
  && yarn run test \
  && bundle install \
  && bundle exec middleman build

FROM nginx:alpine
COPY --from=builder /code/build/* /usr/share/nginx/html/
