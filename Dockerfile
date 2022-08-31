FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/* \
    && wget -q -O /tmp/gh-pages.zip https://github.com/le0pard/pgtune/archive/refs/heads/gh-pages.zip \
    && unzip -d /tmp /tmp/gh-pages.zip \
    && mv /tmp/pgtune-gh-pages/* /usr/share/nginx/html/ \
    && rm -rf /tmp/gh-pages.zip /tmp/pgtune-gh-pages
