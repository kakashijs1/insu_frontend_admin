export type Result<T> =
  | {
      ok: true;
      data: T;
      code: string;
      message?: string;
    }
  | {
      ok: false;
      code: string;
      message: string;
      meta?: unknown;
    };
