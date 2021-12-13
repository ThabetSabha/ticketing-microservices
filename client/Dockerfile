FROM node:16-alpine

WORKDIR /app
COPY package.json .
RUN npm install -f
COPY . .

CMD ["npm", "run", "dev"]