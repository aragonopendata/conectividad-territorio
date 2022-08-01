FROM node:14.20.0-buster 

# LABEL about the custom image
LABEL maintainer="helpdesk@desidedatum.com"
LABEL version="0.1"
LABEL description="Docker image with Angular app that shows 'AOD Indicadores conectividad'"

# Update Ubuntu Software repository
RUN apt update
RUN apt -y install curl


WORKDIR /code/conectividad-territorio-accesible

RUN git clone https://github.com/aragonopendata/conectividad-territorio.git
COPY ./environment.ts /code/conectividad-territorio-accesible/conectividad-territorio-accesible/src/environments/environment.ts
RUN npm install -g @angular/cli@14.0.2
WORKDIR /code/conectividad-territorio-accesible/conectividad-territorio-accesible/
RUN npm install
CMD ng serve --host 0.0.0.0

