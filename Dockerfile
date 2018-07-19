FROM node:9.11

RUN npm i npm@latest -g && npm install yarn -g && npm install nodemon -g

RUN mkdir /var/www/app -p

WORKDIR /var/www/app

# COPY . .

# RUN npm install --quiet

CMD [ "npm" , "run", "dockerstart"]