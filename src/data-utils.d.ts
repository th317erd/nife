export declare function arrayFlatten(value: Array<any>): Array<any>;
export declare function arraySubtract<T extends Array<any>>(value: T, ...args: Array<any>): T;
export declare function arrayUnion<T extends Array<any>>(value: T, ...args: Array<any>): T;
export declare function coerceValue(value: any, type?: string, defaultValue?: any): any;
export declare function pluck(keys: string | Array<string>, ...values: Array<any>): Array<any>;
export declare function propsDiffer(value1: any, value2: any, keys?: Array<string | symbol>, symbols?: boolean): boolean;
export declare function subtractFromArray<T extends Array<any>>(sourceArray: T, ...args: Array<any>): T;
export declare function toArray<T extends Array<T>>(value: Array<T>): Array<T>;
export declare function toArray<T>(value: T): Array<T>;
export declare function toLookup<T>(pluckKey: string, items: Array<T> | { [ keys: string ]: T }): { [ key: string ]: T };
export declare function uniq(items: Array<any>): Array<any>;

export declare type ExtendFilterMethod = (
  key: string,
  val: any,
  thisArg: any,
  dstVal: any,
  dst: Array<any> | object,
  depth: number,
  parentKey: string | null,
  parentObj: Array<any> | object | null
) => boolean;

export declare function extend(
  targetOrOption: number | object | Array<any> | boolean,
  filterOrArg: Array<any> | object | ExtendFilterMethod,
  ...objects: Array<Array<any> | object>,
): Array<any> | object;

export declare namespace extend {
  export const DEEP: number;
  export const NO_OVERWRITE: number;
  export const FILTER: number;
  export const NO_SYMBOLS: number;
  export const INSTANCES: number;
}
