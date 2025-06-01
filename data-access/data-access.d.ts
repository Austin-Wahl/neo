export type DataAccessResponse<T extends (object | number) | object[]> =
  Promise<[error: Error | null, result: T | null]>;
