# --- Builder stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy rest of the app
COPY . .

# Build the Next.js app
RUN yarn build

# --- Runner stage ---
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only the necessary files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy baked-in public folder (used unless overridden by a mounted volume)
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["yarn", "start"]
