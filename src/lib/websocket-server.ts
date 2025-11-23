// Simple in-memory event emitter for notifying clients of data updates
type Listener = () => void;

class DataUpdateEmitter {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    console.log(
      `📡 New SSE subscriber added. Total listeners: ${this.listeners.size}`,
    );
    return () => {
      this.listeners.delete(listener);
      console.log(
        `📡 SSE subscriber removed. Total listeners: ${this.listeners.size}`,
      );
    };
  }

  notify() {
    console.log(
      `📢 Notifying ${this.listeners.size} SSE listeners of data update`,
    );
    this.listeners.forEach((listener) => listener());
  }
}

export const dataUpdateEmitter = new DataUpdateEmitter();
