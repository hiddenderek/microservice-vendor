export function hasDefinedProperties(object: Record<string, any>) {
    const definedProperty = Object.values(object).find((value) => typeof value !== 'undefined');
    if (typeof definedProperty !== 'undefined') {
        return true;
    }
    return false;
}
