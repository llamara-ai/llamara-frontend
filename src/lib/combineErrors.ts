export const combineErrors = (errors: (string | null)[]): string => {
    return errors.filter(error => error !== null).join(' ');
};