// Allow CSS side-effect imports (e.g. import './globals.css')
// Next.js normally generates this via next-env.d.ts, but this covers the
// pre-install state when the next package types aren't resolved yet.
declare module '*.css' {}
