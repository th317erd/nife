export declare interface Resolvable<T> extends Promise<T> {
  resolve(value: any): void;
  reject(value: any): void;
  status(): 'pending' | 'resolved' | 'rejected';
}

export declare interface IterateContext<T, C> {
  stop: () => void;
  isStopped(): boolean;
  index: number;
  value: any;
  key: any;
  context: C;
  collection: T;
  type: string;
}

export function camelCaseToSnakeCase(value: string): string;
export function capitalize(value: string, allWords?: boolean): string;
export function createResolvable<T>(): Resolvable<T>;
export function firstValue(value: Array<any> | null | undefined, defaultValue?: any): any;
export function instanceOf(value: any, ...types: Array<string | Function>): boolean;
export function isEmpty(value: any): boolean;
export function isNotEmpty(value: any): boolean;
export function lastValue(value: Array<any> | null | undefined, defaultValue?: any): any;
export function now(): number;
export function regexpEscape(regexpStr: string): string;
export function sizeOf(value: any): number;
export function sleep(milliseconds?: number): Promise<void>;
export function snakeCaseToCamelCase(value: string, capitalizeFirst?: boolean): string;
export function uncapitalize(value: string): string;
export function get(target: Array<any> | { [ key: string | symbol ]: any } | null | undefined, path: string, defaultValue?: any): any;
export function set(target: Array<any> | { [ key: string | symbol ]: any } | null | undefined, path: string, value: any): string;
export function remove(target: Array<any> | { [ key: string | symbol ]: any } | null | undefined, path: string): any;
export function getMeta(target: Array<any> | { [ key: string | symbol ]: any } | null | undefined, path: string, defaultValue?: any): any;
export function setMeta(target: Array<any> | { [ key: string | symbol ]: any } | null | undefined, path: string, value: any): string;
export function removeMeta(target: Array<any> | { [ key: string | symbol ]: any } | null | undefined, path: string): any;
export function getMetaNS(namespace: string, target: Array<any> | { [ key: string | symbol ]: any } | null | undefined, path: string, defaultValue?: any): any;
export function setMetaNS(namespace: string, target: Array<any> | { [ key: string | symbol ]: any } | null | undefined, path: string, value: any): string;
export function removeMetaNS(namespace: string, target: Array<any> | { [ key: string | symbol ]: any } | null | undefined, path: string): any;
export function iterate<T extends Iterable<any> | Array<any> | { [ key: string | symbol | number ]: any }, C>(value: T, callback: (context: IterateContext<T, C>) => void, context?: C): C;
