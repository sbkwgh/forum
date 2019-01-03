FROM node:8.15.0-jessie
ADD . /code
WORKDIR /code
RUN npm install -g @vue/cli@3.1.3
RUN npm install
EXPOSE 8080
CMD ["npm", "run", "serve"]