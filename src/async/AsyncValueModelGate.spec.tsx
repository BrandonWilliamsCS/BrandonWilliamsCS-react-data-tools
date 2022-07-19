import { render, screen, act } from "@testing-library/react";
import React from "react";

import { makeTestAsyncValueModel } from "../testUtility/makeTestAsyncValueModel";
import { AsyncValueModelGate } from "./AsyncValueModelGate";

const renderValue = (value: string) => <div>value-{value}</div>;
const renderError = (error: string) => <div>error-{error}</div>;
const renderPendingFlat = <div>pending</div>;

describe("AsyncValueModelGate", () => {
  it("renders no content when initial status stream is undefined", async () => {
    // Arrange
    // Act
    render(
      <AsyncValueModelGate<string>
        valueModel={undefined}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncValueModelGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
    expect(screen.queryByText("value-first")).toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders pending content while current status is pending", async () => {
    // Arrange
    const { valueModel } = makeTestAsyncValueModel<string, string>();
    // Act
    render(
      <AsyncValueModelGate
        valueModel={valueModel}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncValueModelGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).not.toBeNull();
    expect(screen.queryByText("value-first")).toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders value content once current status reflects success", async () => {
    // Arrange
    const { valueModel, promiseSets } = makeTestAsyncValueModel<
      string,
      string
    >();
    // Act
    render(
      <AsyncValueModelGate
        valueModel={valueModel}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncValueModelGate>,
    );
    await act(async () => {
      promiseSets[0].resolve("first");
      await promiseSets[0].promise;
    });
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
    expect(screen.queryByText("value-first")).not.toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders error content once current status reflects failure", async () => {
    // Arrange
    const { valueModel, promiseSets } = makeTestAsyncValueModel<
      string,
      string
    >();
    // Act
    render(
      <AsyncValueModelGate
        valueModel={valueModel}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncValueModelGate>,
    );
    await act(async () => {
      promiseSets[0].reject("first");
      try {
        await promiseSets[0].promise;
      } catch {}
    });
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
    expect(screen.queryByText("value-first")).toBeNull();
    expect(screen.queryByText("error-first")).not.toBeNull();
  });

  it("renders pending above value content when current status is pending with prior value", async () => {
    // Arrange
    const { valueModel, promiseSets } = makeTestAsyncValueModel<
      string,
      string
    >();
    // Act
    render(
      <AsyncValueModelGate
        valueModel={valueModel}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncValueModelGate>,
    );
    await act(async () => {
      const { promise, resolve } = promiseSets[0];
      resolve("first");
      await promise;
      valueModel.reload();
    });
    // Assert
    expect(screen.queryByText("pending")).not.toBeNull();
    expect(screen.queryByText("value-first")).not.toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders error above value content when current status has an error with prior value", async () => {
    // Arrange
    const { valueModel, promiseSets } = makeTestAsyncValueModel<
      string,
      string
    >();
    // Act
    render(
      <AsyncValueModelGate
        valueModel={valueModel}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncValueModelGate>,
    );
    await act(async () => {
      const { promise, resolve } = promiseSets[0];
      resolve("first");
      await promise;
      valueModel.reload();
      const { promise: secondPromise, reject: secondReject } = promiseSets[1];
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
    const { valueModel } = makeTestAsyncValueModel<string, string>();
    // Act
    render(
      <AsyncValueModelGate
        valueModel={valueModel}
        errorContent={renderError}
        pendingContent={undefined}
      >
        {renderValue}
      </AsyncValueModelGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
  });

  it("renders no error content when `errorContent` is omitted", async () => {
    // Arrange
    const { valueModel, promiseSets } = makeTestAsyncValueModel<
      string,
      string
    >();
    // Act
    render(
      <AsyncValueModelGate
        valueModel={valueModel}
        errorContent={undefined}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncValueModelGate>,
    );
    await act(async () => {
      promiseSets[0].reject("first");
      try {
        await promiseSets[0].promise;
      } catch {}
    });
    // Assert
    expect(screen.queryByText("error-first")).toBeNull();
  });
});
