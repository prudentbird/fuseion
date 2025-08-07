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

  log(message: any, context?: string) {
    const obj = { context: context || this.context };
    if (typeof message === "object") {
      this.pino.info(obj, message.message, ...message.optionalParams);
    } else {
      this.pino.info(obj, message);
    }
  }

  error(message: any, trace?: string, context?: string) {
    const obj = { context: context || this.context };
    if (typeof message === "object") {
      this.pino.error(obj, message.message, ...message.optionalParams);
    } else {
      this.pino.error(obj, message);
    }
    if (trace) {
      this.pino.error(trace);
    }
  }

  warn(message: any, context?: string) {
    const obj = { context: context || this.context };
    if (typeof message === "object") {
      this.pino.warn(obj, message.message, ...message.optionalParams);
    } else {
      this.pino.warn(obj, message);
    }
  }

  debug(message: any, context?: string) {
    const obj = { context: context || this.context };
    if (typeof message === "object") {
      this.pino.debug(obj, message.message, ...message.optionalParams);
    } else {
      this.pino.debug(obj, message);
    }
  }

  verbose(message: any, context?: string) {
    const obj = { context: context || this.context };
    if (typeof message === "object") {
      this.pino.trace(obj, message.message, ...message.optionalParams);
    } else {
      this.pino.trace(obj, message);
    }
  }
}
