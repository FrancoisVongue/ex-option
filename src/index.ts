export type Matcher<V,R> = (v: V) => R
export type MatcherObj<T extends string,V,R> = Record<T, Matcher<V, R>>
export type PartialMatcherObj<T extends string,V,R> = 
  & Partial<Record<T, Matcher<V, R>>>
  & {'*': Matcher<V, R>}

export class Option<T extends string, V> {
  constructor(
    private _type: T,
    private _value: V
  ) {}

  match<R>(matcher: MatcherObj<T, V, R>): R {
    const action = matcher[this._type];
    return action(this._value);
  }

  imatch<R>(matcher: PartialMatcherObj<T, V, R>): R {
    const action = matcher[this._type] ?? matcher['*'];
    return action(this._value); 
  }
  
  type()  { return this._type; }
  value() { return this._value; }
  
  static catch<S extends string, E extends string, R>(
    successName: S, 
    errName: E, 
    fn: (...args: any[]) => R
  ) {
    try {
      const result = fn();
      return new Option(successName, result);
    } catch(e) {
      return new Option(errName, e as Error);
    }
  }

  static async asyncCatch<S extends string, E extends string, R>(
    successName: S, 
    errName: E, 
    fn: (...args: any[]) => Promise<R>
  ) {
    try {
      const result = await fn();
      return new Option(successName, result);
    } catch(e) {
      return new Option(errName, e as Error);
    }
  }
}