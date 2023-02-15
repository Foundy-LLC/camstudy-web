export function getEnumKeyByEnumValue<T extends { [index: string]: string }>(
  myEnum: T,
  enumValue: string
): keyof T {
  return Object.keys(myEnum).find(
    (key) => myEnum[key] === enumValue
  ) as keyof T;
}
