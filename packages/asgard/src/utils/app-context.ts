import { AsgardApp } from "../app";
import type { BaseEnvironment, Props } from "../types";
import { Context } from "./context";

type Extract<Type> = Type extends AsgardApp<infer X> ? X : never;

const AppContext = Context.create("AppContext");
export const withAppContext = AppContext.with;
export const useAppContext = AppContext.use;

const EnvContext = Context.create("EnvContext");
export const withEnvContext = EnvContext.with;
export const useEnvContext = EnvContext.use;

export function createUseAppContext<
  TAsgardApp extends AsgardApp<BaseEnvironment>,
>() {
  return { useApp: useAppContext as () => Props<Extract<TAsgardApp>> };
}

export function createUseEnv<TAsgardApp extends AsgardApp<BaseEnvironment>>() {
  return { useEnv: useEnvContext as () => Extract<TAsgardApp> };
}
