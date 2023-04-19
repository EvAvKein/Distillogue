FROM nginx:1.21.1-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY /backend/nginx/prod.nginx.conf /etc/nginx/conf.d