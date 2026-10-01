import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
Object.assign(globalThis, { IntersectionObserver: MockIntersectionObserver });

// jsdom has no layout; treat every element as visible for focus-trap checks.
Object.defineProperty(HTMLElement.prototype, "offsetParent", {
  configurable: true,
  get() { return this.parentNode; },
});
HTMLImageElement.prototype.decode = () => Promise.resolve();
HTMLMediaElement.prototype.play = () => Promise.resolve();
HTMLMediaElement.prototype.pause = () => {};
