# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace apps/web --include-workspace-root

COPY apps/web apps/web

# The API URL + GA id are inlined into client bundles at build time.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GA_ID=
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
RUN npm run build --workspace apps/web

# ---------- runtime stage ----------
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

# Next.js "standalone" output bundles a minimal server + only the deps it needs.
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
# standalone does NOT include public/ — copy it so static assets (headshot) are served.
COPY --from=build /repo/apps/web/public ./apps/web/public

USER app
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

CMD ["node", "apps/web/server.js"]
