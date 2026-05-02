FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
ENV NUXT_PUBLIC_API_BASE=http://localhost:3001
ENV NUXT_API_BASE=http://backend:3001
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
