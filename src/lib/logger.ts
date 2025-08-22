import pino, { Logger as PinoLogger, Level } from "pino";

export interface LoggerOptions {
  level?: Level;
  prettyPrint?: boolean;
}

export class Logger {
  private readonly pino: PinoLogger;
  private readonly context?: string;

  constructor(context?: string, options: LoggerOptions = {}) {
    this.context = context;
    this.pino = pino({
      level: options.level || "info",
      transport: options.prettyPrint
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              crlf: false,
              errorLikeObjectKeys: ["err", "error"],
              errorProps: "",
              messageKey: "msg",
              ignore: "pid,hostname",
              singleLine: false,
              translateTime: "SYS:standard",
            },
          }
        : undefined,
    });
  }

  private stringifyMessage(message: unknown): string {
    if (message == null) return "";
    if (typeof message === "string") return message;
    if (message instanceof Error) return message.message;
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }

  log(message: unknown, context?: string) {
    const obj = { context: context || this.context };
    const msg = this.stringifyMessage(message);
    this.pino.info(obj, msg);
  }

  error(message: unknown, trace?: string, context?: string) {
    const obj = { context: context || this.context };
    const msg = this.stringifyMessage(message);
    if (trace) this.pino.error({ ...obj, trace }, msg);
    else this.pino.error(obj, msg);
  }

  warn(message: unknown, context?: string) {
    const obj = { context: context || this.context };
    const msg = this.stringifyMessage(message);
    this.pino.warn(obj, msg);
  }

  debug(message: unknown, context?: string) {
    const obj = { context: context || this.context };
    const msg = this.stringifyMessage(message);
    this.pino.debug(obj, msg);
  }

  verbose(message: unknown, context?: string) {
    const obj = { context: context || this.context };
    const msg = this.stringifyMessage(message);
    this.pino.trace(obj, msg);
  }
}
