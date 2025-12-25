FROM node:22-bullseye

WORKDIR /workspace

# Install dependencies
COPY package*.json ./
RUN npm ci

ENV NODE_ENV=development
ENV PORT=5000
ENV PATH=/workspace/node_modules/.bin:$PATH

EXPOSE 5000

CMD ["npm", "run", "dev"]
