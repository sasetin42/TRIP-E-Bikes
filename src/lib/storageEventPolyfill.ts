if (typeof window !== 'undefined' && !window.StorageEvent) {
  try {
    class StorageEventPolyfill extends Event {
      key: string | null = null;
      oldValue: string | null = null;
      newValue: string | null = null;
      url: string = '';
      storageArea: Storage | null = null;

      constructor(type: string, init?: StorageEventInit) {
        super(type, init);
        if (init) {
          this.key = init.key ?? null;
          this.oldValue = init.oldValue ?? null;
          this.newValue = init.newValue ?? null;
          this.url = init.url ?? '';
          this.storageArea = init.storageArea ?? null;
        }
      }
    }
    (window as any).StorageEvent = StorageEventPolyfill;
  } catch (e) {
    console.warn("Could not polyfill StorageEvent:", e);
  }
}

export {};
