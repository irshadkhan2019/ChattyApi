FROM node

EXPOSE 8080

COPY . /usr/app
WORKDIR /usr/app

RUN npm install -g nodemon
RUN npm install 
CMD ["npm","run","dev"]
