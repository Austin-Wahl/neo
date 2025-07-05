export type DataAccessResponse<T extends (object | number) | object[] | null> =
  Promise<[error: Error | null, result: T | null]>;
