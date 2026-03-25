export const globalNormalizer = (value, attribute) => {
    if (typeof value !== 'string') return value;
    return value.trim().replace(/^-/, '').toUpperCase();
};