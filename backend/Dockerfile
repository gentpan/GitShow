FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o gitshow .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/gitshow .
COPY --from=builder /app/config.json .
COPY --from=builder /app/settings.json .
EXPOSE 3001
CMD ["./gitshow"]
