// src/services/clientLogging.ts
import axios from 'axios';

class ClientLoggingService {
  private static instance: ClientLoggingService;

  private constructor() {}

  public static getInstance(): ClientLoggingService {
    if (!this.instance) {
      this.instance = new ClientLoggingService();
    }
    return this.instance;
  }

  async log(message: string, level: 'error' | 'warn' | 'info' | 'debug' = 'error') {
    try {
      await axios.post('/api/logging', { message, level });
    } catch (error) {
      console.error('Client-side logging failed', error);
    }
  }

  error(message: string) {
    this.log(message, 'error');
  }

  warn(message: string) {
    this.log(message, 'warn');
  }

  info(message: string) {
    this.log(message, 'info');
  }

  debug(message: string) {
    this.log(message, 'debug');
  }
}

export const clientLogger = ClientLoggingService.getInstance();