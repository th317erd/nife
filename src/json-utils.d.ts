export declare function safeJSONStringify(
  obj: any,
  formatter?: Array<number | string> | ((key: string | null, value: any) => any),
  space?: number
): string;

export declare function safeJSONParse(data: any): any;
