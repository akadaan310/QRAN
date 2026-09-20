import type { Router } from "./router";

// A single shared router instance, set once by main.ts. Screen modules
// import `goto`/`getRouter` instead of threading the Router through every
// render call — this app has one router for its whole lifetime.
let instance: Router | null = null;

export function setRouter(r: Router): void {
  instance = r;
}

export function getRouter(): Router {
  if (!instance) throw new Error("router not initialized");
  return instance;
}

export function goto(path: string): void {
  getRouter().navigate(path);
}
