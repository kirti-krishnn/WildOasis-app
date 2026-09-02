export const logger = {
  warn(message: string, meta?: unknown) {
    console.warn(message, meta || '');
  },
  error(message: string, meta?: unknown) {
    console.error(message, meta || '');
  },
};


