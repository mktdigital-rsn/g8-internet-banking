This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy to DigitalOcean App Platform

This repository includes a production Dockerfile and [DigitalOcean app spec](.do/app.yaml). Create an App Platform app from the repository and select the Dockerfile deployment method; App Platform will build the image and route traffic to port `3000`.

The platform supplies the `PORT` environment variable at runtime. In App Platform, set public values such as `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_BRAND` with **Build Time** scope (or **Run and Build Time** scope), then trigger a new deployment. The Dockerfile passes those build arguments to Next.js; `NEXT_PUBLIC_*` values are embedded in the client bundle and cannot be changed by only restarting a running container.

To test the production image locally:

```bash
docker build -t g8-internet-banking .
docker run --rm -p 3000:3000 g8-internet-banking
```
