export type DataAccessResponse<
  T extends (object | number | boolean) | object[] | null
> = Promise<[error: Error | null, result: T | null]>;
