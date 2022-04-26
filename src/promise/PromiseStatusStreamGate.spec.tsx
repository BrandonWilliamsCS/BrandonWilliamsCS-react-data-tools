import {
  Operation,
  OperationModel,
} from "@brandonwilliamscs/data-tools/operation";
import { TrackedPromise } from "@brandonwilliamscs/data-tools/promise";
import { render, screen, act } from "@testing-library/react";
import React from "react";

import { PromiseStatusStreamGate } from "./PromiseStatusStreamGate";
import {
  makeTestPromise,
  TestPromiseSet,
} from "../testUtility/makeTestPromise";

const renderValue = (value: string) => <div>value-{value}</div>;
const renderError = (error: string) => <div>error-{error}</div>;
const renderPendingFlat = <div>pending</div>;

describe("PromiseStatusStreamGate", () => {
  it("renders no content when initial status stream is undefined", async () => {
    // Arrange
    // Act
    render(
      <PromiseStatusStreamGate
        statusStream={undefined}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseStatusStreamGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
    expect(screen.queryByText("value-first")).toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders pending content while current status is pending", async () => {
    // Arrange
    const { promise } = makeTestPromise<string, string>();
    // Act
    render(
      <PromiseStatusStreamGate
        statusStream={new TrackedPromise(promise)}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseStatusStreamGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).not.toBeNull();
    expect(screen.queryByText("value-first")).toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders value content once current status reflects success", async () => {
    // Arrange
    const { promise, resolve } = makeTestPromise<string, string>();
    // Act
    render(
      <PromiseStatusStreamGate
        statusStream={new TrackedPromise(promise)}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseStatusStreamGate>,
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

  it("renders error content once current status reflects failure", async () => {
    // Arrange
    const { promise, reject } = makeTestPromise<string, string>();
    // Act
    render(
      <PromiseStatusStreamGate
        statusStream={new TrackedPromise(promise)}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseStatusStreamGate>,
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

  it("renders pending above value content when current status is pending with prior value", async () => {
    // Arrange
    const { operationModel, promiseSets } = makeTestOperationModel();
    // Act
    render(
      <PromiseStatusStreamGate
        statusStream={operationModel}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseStatusStreamGate>,
    );
    await act(async () => {
      operationModel.execute("");
      const { promise, resolve } = promiseSets[0];
      resolve("first");
      await promise;
      operationModel.execute("");
    });
    // Assert
    expect(screen.queryByText("pending")).not.toBeNull();
    expect(screen.queryByText("value-first")).not.toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders error above value content when current status has an error with prior value", async () => {
    // Arrange
    const { operationModel, promiseSets } = makeTestOperationModel();
    // Act
    render(
      <PromiseStatusStreamGate
        statusStream={operationModel}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseStatusStreamGate>,
    );
    await act(async () => {
      operationModel.execute("");
      const { promise, resolve } = promiseSets[0];
      resolve("first");
      await promise;
      operationModel.execute("");
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
    const { promise } = makeTestPromise<string, string>();
    // Act
    render(
      <PromiseStatusStreamGate
        statusStream={new TrackedPromise(promise)}
        errorContent={renderError}
        pendingContent={undefined}
      >
        {renderValue}
      </PromiseStatusStreamGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
  });

  it("renders no error content when `errorContent` is omitted", async () => {
    // Arrange
    const { promise, reject } = makeTestPromise<string, string>();
    // Act
    render(
      <PromiseStatusStreamGate
        statusStream={new TrackedPromise(promise)}
        errorContent={undefined}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </PromiseStatusStreamGate>,
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

function makeTestOperationModel() {
  const promiseSets: Array<TestPromiseSet<string, string>> = [];
  const operation: Operation<string, string> = jest
    .fn()
    .mockImplementation(() => {
      const promiseSet = makeTestPromise<string, string>();
      promiseSets.push(promiseSet);
      return promiseSet.promise;
    });
  const operationModel = new OperationModel(operation, true);
  return { operationModel, promiseSets };
}
