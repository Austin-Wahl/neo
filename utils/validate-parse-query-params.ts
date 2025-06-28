import qs from "qs";
import { z, ZodTypeAny } from "zod";

type Props<T extends z.AnyZodObject> = {
  schema: T;
  url: string;
};
/**
 * Helper function which takes a url and will run validation against query params. Stips out all invalid params.
 * @param {Props} props Schema and URL to validate and parse query params for
 * @returns {Record<string | number | symbol, unknown>} Object with valid query params only
 */
function parseAndValidateQueryParams<T extends z.AnyZodObject>({
  schema,
  url,
}: Props<T>): Partial<z.infer<T>> {
  const urlParams = qs.parse(url.split("?")[1] || "");
  const result = schema.safeParse(urlParams);

  if (result.success) {
    return result.data;
  }

  const validParams: Partial<z.infer<T>> = {};
  const shape = schema.shape as Record<keyof z.infer<T>, ZodTypeAny>;

  (Object.keys(shape) as Array<keyof z.infer<T>>).forEach((key) => {
    if (key in urlParams) {
      const fieldResult = shape[key].safeParse(urlParams[key]);
      if (fieldResult.success) {
        validParams[key] = fieldResult.data;
      }
    }
  });

  return validParams;
}

export default parseAndValidateQueryParams;

export function defaultQueryParams<T extends Record<string, unknown>>(
  orderByFields: [keyof T & string, ...(keyof T & string)[]]
) {
  const orderByEnum = z.enum(orderByFields);

  const schema = z.object({
    limit: z
      .preprocess(
        (val) => parseInt(val as string, 10),
        z.number().min(0).max(100).default(20).optional()
      )
      .optional(),
    offset: z
      .preprocess(
        (val) => parseInt(val as string, 10),
        z.number().min(0).default(0).optional()
      )
      .optional(),
    search: z.string().optional(),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
    orderBy: orderByEnum.default(orderByFields[0]),
  });

  return schema;
}
