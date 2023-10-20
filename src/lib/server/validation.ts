export type Errors = Record<string, string[]>;

export const initializeErrorsByField = (errors: Errors, fieldName: string) => {
  if (!(fieldName in errors)) {
    errors[fieldName] = [];
  }
};
