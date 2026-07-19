/** Minimal typed event emitter shared by the transports. */
export class Emitter<Events extends { [K in keyof Events]: (...args: any[]) => void }> {
  private listeners: { [K in keyof Events]?: Set<Events[K]> } = {};

  on<E extends keyof Events>(event: E, cb: Events[E]): () => void {
    (this.listeners[event] ??= new Set()).add(cb);
    return () => this.listeners[event]?.delete(cb);
  }

  protected emit<E extends keyof Events>(event: E, ...args: Parameters<Events[E]>): void {
    this.listeners[event]?.forEach((cb) => cb(...args));
  }

  protected clearListeners(): void {
    this.listeners = {};
  }
}

let counter = 0;
/** Stable-ish unique id without pulling in a uuid dep. */
export function uid(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}
