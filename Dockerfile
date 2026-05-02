FROM node:20-alpine AS web-builder
WORKDIR /src
COPY package*.json ./
RUN npm ci
COPY app.vue nuxt.config.ts postcss.config.js tailwind.config.ts ./
COPY assets ./assets
COPY components ./components
COPY composables ./composables
COPY layouts ./layouts
COPY pages ./pages
COPY public ./public
RUN npm run generate

FROM golang:1.25-alpine AS app-builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY main.go ./
COPY --from=web-builder /src/.output ./.output
RUN go build -o gitshow .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=app-builder /src/gitshow ./gitshow
COPY config.json.example ./config.json
COPY settings.json.example ./settings.json
ENV PORT=3000
EXPOSE 3000
CMD ["./gitshow"]
