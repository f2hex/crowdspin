FROM node:18.20.2-alpine

MAINTAINER Franco Fiorese <f2coder@f2hex.com>

#RUN     apk --update add nginx

WORKDIR /app
COPY    package.json crowdspin.js citizengen.js geodata.js peoplenames.js  /app/
#RUN    npm install npm@latest \
RUN     npm install
RUN     chmod +x /app/crowdspin.js

ENTRYPOINT [ "/app/crowdspin.js" ]
