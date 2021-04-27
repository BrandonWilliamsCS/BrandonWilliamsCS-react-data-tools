import React, { PropsWithChildren } from "react";

export type ResourceDictionary = Record<string, any>;

/**
 * Provides access to the resources kept by each provider above the consumer.
 * @returns the value of the entire resource dictionary
 */
export function useResources<T extends ResourceDictionary>(): T {
  // Technically, there's no guarantee that the stored data fits type `T`.
  // It's all known at runtime, so the consumer must type check anyway.
  const resourceState = (React.useContext(
    ResourceContext,
  ) as unknown) as ReactState<T>;
  return resourceState[0];
}

/**
 * Allows consumers to set resource values.
 * Only sets values at the closest contextual level.
 * @returns a setter function that accepts the resource name and value
 */
export function useSetResource<T extends ResourceDictionary>(): (
  name: keyof T & string,
  value: any,
) => void {
  const [, setResources] = React.useContext(ResourceContext);
  return React.useCallback(
    (name: string, value: any) => {
      setResources((prevValue) => ({
        ...prevValue,
        [name]: value,
      }));
    },
    [setResources],
  );
}

/**
 * Maintains a string-keyed dictionary of "resources" for use in its children components.
 * These resources may be used independently of "source". This means not only could
 * the resource have been "set" by any other component or even model code, but
 * there's also no dependency upon one particular provider.
 * Notably, ALL resources must have explicit values provided initially, either
 * explicitly by the parent component or implicitly by an ancestor provider.
 * This prevents the need to force `undefined` values into the fields of `T`.
 * @param initialResources - Values to use before they have otherwise been set
 * @typeParam T - Maps resource keys to their value types
 * @typeParam P - Indicates the keys (and associated types) expected from a parent provider/context
 * @returns the children rendered so as to enable `useResources` at this level.
 */
export function ResourceProvider<
  T extends ResourceDictionary,
  P extends ResourceDictionary = {}
>({
  children,
  initialResources,
}: PropsWithChildren<ResourceProviderProps<T, P>>) {
  // Allow nested resource structures by merging data from any parent context.
  const parentResources = useResources<P>();
  const resourceState: ReactState<ResourceDictionary> = React.useState<ResourceDictionary>(
    { ...parentResources, ...initialResources },
  );
  return (
    <ResourceContext.Provider value={resourceState}>
      {children}
    </ResourceContext.Provider>
  );
}

export interface ResourceProviderProps<
  T extends ResourceDictionary,
  P extends ResourceDictionary
> {
  // T must be fully represented, but fields included in P are optional.
  initialResources: Omit<T, keyof P> & Partial<T>;
}

// Don't export this - it should only be consumed through the component and hook.
const ResourceContext = React.createContext<ReactState<ResourceDictionary>>([
  {},
  () => {},
]);

// This is just an alias for the info return by React.useState.
type ReactState<T> = [T, React.Dispatch<React.SetStateAction<T>>];
