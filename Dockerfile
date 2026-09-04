# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS builder
# DigitalOcean passes build-scoped environment variables as Docker build args.
# Next.js substitutes NEXT_PUBLIC_* values into browser code during `next build`.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_VARIANT
ARG NEXT_PUBLIC_BRAND
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_VARIANT=$NEXT_PUBLIC_VARIANT
ENV NEXT_PUBLIC_BRAND=$NEXT_PUBLIC_BRAND
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# App Platform injects PORT. Next's standalone server defaults to 3000 locally.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
