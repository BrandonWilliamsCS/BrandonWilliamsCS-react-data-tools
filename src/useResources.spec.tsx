import React from "react";
import {
  act,
  renderHook,
  WrapperComponent,
} from "@testing-library/react-hooks";

import { useResources, useSetResource, ResourceProvider } from "./useResources";

describe("useResources", () => {
  it("returns initial resources", () => {
    // Arrange
    const initialResources: BaseResources = {
      a: 5,
      b: "5",
      s: 0,
    };

    // Act
    const providerRootAsWrapper: WrapperComponent<
      React.PropsWithChildren<{}>
    > = ({ children }) => (
      <ResourceProvider initialResources={initialResources}>
        {children}
      </ResourceProvider>
    );
    const { result } = renderHook(() => useResources<BaseResources>(), {
      wrapper: providerRootAsWrapper,
    });

    // Assert
    const resources = result.current;
    expect(resources.a).toBe(5);
    expect(resources.b).toBe("5");
  });

  it("returns latest resources after setting", () => {
    // Arrange
    const initialResources: BaseResources = {
      a: 5,
      b: "5",
      s: 0,
    };

    // Act
    const providerRootAsWrapper: WrapperComponent<
      React.PropsWithChildren<{}>
    > = ({ children }) => (
      <ResourceProvider initialResources={initialResources}>
        {children}
      </ResourceProvider>
    );
    const { result } = renderHook(
      () => {
        const resources = useResources<BaseResources>();
        const setter = useSetResource<BaseResources>();
        return { resources, setter };
      },
      {
        wrapper: providerRootAsWrapper,
      },
    );
    act(() => {
      result.current.setter("a", 6);
    });

    // Assert
    const resources = result.current.resources;
    expect(resources.a).toBe(6);
    expect(resources.b).toBe("5");
  });

  it("uses inner resources when nested", () => {
    // Arrange
    const initialResources: BaseResources = {
      a: 5,
      b: "5",
      s: 0,
    };
    const initialInnerResources: InnerResources = {
      b: 10,
      c: "10",
      s: 1,
    };

    // Act
    const providerRootAsWrapper: WrapperComponent<
      React.PropsWithChildren<{}>
    > = ({ children }) => (
      <ResourceProvider initialResources={initialResources}>
        <ResourceProvider initialResources={initialInnerResources}>
          {children}
        </ResourceProvider>
      </ResourceProvider>
    );
    const { result } = renderHook(() => useResources<InnerResources>(), {
      wrapper: providerRootAsWrapper,
    });

    // Assert
    const resources = result.current;
    expect(resources.b).toBe(10);
    expect(resources.c).toBe("10");
    expect(resources.s).toBe(1);
  });

  it("can use current outer resource to omit initial inner resource", () => {
    // Arrange
    const initialResources: BaseResources = {
      a: 5,
      b: "5",
      s: 0,
    };
    const initialInnerResources = {
      b: 10,
      c: "10",
    };

    // Act
    const providerRootAsWrapper: WrapperComponent<
      React.PropsWithChildren<{}>
    > = ({ children }) => (
      <ResourceProvider initialResources={initialResources}>
        <ResourceProvider initialResources={initialInnerResources}>
          {children}
        </ResourceProvider>
      </ResourceProvider>
    );
    const { result } = renderHook(() => useResources<InnerResources>(), {
      wrapper: providerRootAsWrapper,
    });

    // Assert
    const resources = result.current;
    expect(resources.b).toBe(10);
    expect(resources.c).toBe("10");
    expect(resources.s).toBe(0);
  });
});

interface BaseResources {
  a: number;
  b: string;
  s: number;
}

interface InnerResources {
  b: number;
  c: string;
  s: number;
}
