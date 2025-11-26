FROM nginx:alpine

# Xóa default config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy thư mục build của React vào nginx
COPY build/ /usr/share/nginx/html

# Copy config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]