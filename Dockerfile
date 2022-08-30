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

# FROM jekyll/minimal
# COPY --from=builder /code/build/* /srv/jekyll/
# RUN gem install --no-document webrick
# CMD ["jekyll", "serve"]

FROM nginx:alpine
COPY --from=builder /code/build/* /usr/share/nginx/html/
