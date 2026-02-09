/**
 * Parses a request's form body into a Map of string key-value pairs.
 *
 * File entries are silently ignored — only string values are included.
 *
 * @param request - The incoming HTTP request with form data body
 * @returns A Map of field names to string values
 */
export async function parseFormBody(request: Request): Promise<Map<string, string>> {
  const formData = await request.formData();
  const result = new Map<string, string>();

  formData.forEach((value: FormDataEntryValue, key: string) => {
    if (typeof value === 'string') {
      result.set(key, value);
    }
  });

  return result;
}

/**
 * Gets a form field value, returning null if missing or empty.
 *
 * @param form - The parsed form data Map
 * @param field - The field name to look up
 * @returns The field value, or null if missing or empty
 */
export function getFormField(form: Map<string, string>, field: string): string | null {
  const value = form.get(field);
  if (value === undefined || value === '') {
    return null;
  }
  return value;
}
