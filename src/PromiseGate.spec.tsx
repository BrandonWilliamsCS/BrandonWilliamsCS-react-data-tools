import React from "react";
import { render, screen, act } from "@testing-library/react";
import {
  PromiseStatus,
  processPromise,
} from "@blueharborsolutions/data-tools/promise";

import { PromiseGate } from "./PromiseGate";

const initialStatus: PromiseStatus<string, string> = processPromise<
  string,
  string
>(new Promise(() => {}));
const renderValue = (value: string) => <div>value-{value}</div>;
const renderError = (error: string) => <div>error-{error}</div>;
const renderPendingFlat = <div>pending</div>;

describe("PromiseGate", () => {
  it("renders pending content before promise resolves", async () => {
    // Arrange
    const { promise } = makePromise<string, string>();
    // Act
    const { rerender } = render(
      <PromiseGate
        promise={promise}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).not.toBeNull();
    expect(screen.queryByText("value-first")).toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders value content when promise resolves", async () => {
    // Arrange
    const { promise, resolve } = makePromise<string, string>();
    // Act
    const { rerender } = render(
      <PromiseGate
        promise={promise}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseGate>,
    );
    await act(async () => {
      resolve("first");
      await promise;
    });
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
    expect(screen.queryByText("value-first")).not.toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders error content when promise rejects", async () => {
    // Arrange
    const { promise, reject } = makePromise<string, string>();
    // Act
    const { rerender } = render(
      <PromiseGate
        promise={promise}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseGate>,
    );
    await act(async () => {
      reject("first");
      try {
        await promise;
      } catch {}
    });
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
    expect(screen.queryByText("value-first")).toBeNull();
    expect(screen.queryByText("error-first")).not.toBeNull();
  });

  it("renders pending above value content when a new promise follows a resolved one", async () => {
    // Arrange
    const { promise, resolve } = makePromise<string, string>();
    const { promise: secondPromise } = makePromise<string, string>();
    // Act
    const { rerender } = render(
      <PromiseGate
        promise={promise}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseGate>,
    );
    await act(async () => {
      resolve("first");
      await promise;
    });
    rerender(
      <PromiseGate
        promise={secondPromise}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).not.toBeNull();
    expect(screen.queryByText("value-first")).not.toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders pending content when a new promise follows an rejected one", async () => {
    // Arrange
    const { promise, reject } = makePromise<string, string>();
    const { promise: secondPromise } = makePromise<string, string>();
    // Act
    const { rerender } = render(
      <PromiseGate
        promise={promise}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseGate>,
    );
    await act(async () => {
      reject("first");
      try {
        await promise;
      } catch {}
    });
    rerender(
      <PromiseGate
        promise={secondPromise}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).not.toBeNull();
    expect(screen.queryByText("value-first")).toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders error over value content when a rejected promise follows a resolved one", async () => {
    // Arrange
    const { promise, resolve } = makePromise<string, string>();
    const { promise: secondPromise, reject: secondReject } = makePromise<
      string,
      string
    >();
    // Act
    const { rerender } = render(
      <PromiseGate
        promise={promise}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseGate>,
    );
    await act(async () => {
      resolve("first");
      await promise;
    });
    rerender(
      <PromiseGate
        promise={secondPromise}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseGate>,
    );
    await act(async () => {
      secondReject("second");
      try {
        await secondPromise;
      } catch {}
    });
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
    expect(screen.queryByText("value-first")).not.toBeNull();
    expect(screen.queryByText("error-second")).not.toBeNull();
  });

  it("renders no pending content when `pendingContent` is omitted", async () => {
    // Arrange
    const { promise } = makePromise<string, string>();
    // Act
    const { rerender } = render(
      <PromiseGate
        promise={promise}
        errorContent={renderError}
        pendingContent={undefined}
      >
        {renderValue}
      </PromiseGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
  });

  it("renders no error content when `errorContent` is omitted", async () => {
    // Arrange
    const { promise, reject } = makePromise<string, string>();
    // Act
    const { rerender } = render(
      <PromiseGate
        promise={promise}
        errorContent={undefined}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseGate>,
    );
    await act(async () => {
      reject("first");
      try {
        await promise;
      } catch {}
    });
    // Assert
    expect(screen.queryByText("error-first")).toBeNull();
  });
});

function makePromise<T, E>() {
  let resolve!: (t: T) => void;
  let reject!: (e: E) => void;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { promise, resolve, reject };
}
