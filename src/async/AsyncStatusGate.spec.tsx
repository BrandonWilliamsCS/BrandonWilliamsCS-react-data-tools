import React from "react";
import { render, screen } from "@testing-library/react";
import {
  AsyncStatus,
  process,
  succeed,
  fail,
  initialStatus,
} from "@brandonwilliamscs/data-tools/async/AsyncStatus";

import { AsyncStatusGate } from "./AsyncStatusGate";

const pendingStatus: AsyncStatus<string, string> = process<string, string>();
const renderValue = (value: string) => <div>value-{value}</div>;
const renderError = (error: string) => <div>error-{error}</div>;
const renderPendingFlat = <div>pending</div>;
const renderPendingFunction = () => <div>pending</div>;

describe("AsyncStatusGate", () => {
  it("renders no content when status is initial", async () => {
    // Arrange
    // Act
    const { rerender } = render(
      <AsyncStatusGate
        status={initialStatus}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
    expect(screen.queryByText("value-first")).toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });
  it("renders no content when status is undefined", async () => {
    // Arrange
    // Act
    const { rerender } = render(
      <AsyncStatusGate
        status={undefined}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
    expect(screen.queryByText("value-first")).toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders pending content when status represents initial processing", async () => {
    // Arrange
    // Act
    const { rerender } = render(
      <AsyncStatusGate
        status={pendingStatus}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).not.toBeNull();
    expect(screen.queryByText("value-first")).toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders value content when status represents initial success", async () => {
    // Arrange
    const secondaryStatus = succeed<string, string>("first");
    // Act
    const { rerender } = render(
      <AsyncStatusGate
        status={pendingStatus}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    rerender(
      <AsyncStatusGate
        status={secondaryStatus}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
    expect(screen.queryByText("value-first")).not.toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders error content when status represents initial error", async () => {
    // Arrange
    const secondaryStatus = fail(pendingStatus, "first");
    // Act
    const { rerender } = render(
      <AsyncStatusGate
        status={pendingStatus}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    rerender(
      <AsyncStatusGate
        status={secondaryStatus}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
    expect(screen.queryByText("value-first")).toBeNull();
    expect(screen.queryByText("error-first")).not.toBeNull();
  });

  it("renders pending above value content when status represents processing after success", async () => {
    // Arrange
    const secondaryStatus = process(succeed<string, string>("first"));
    // Act
    const { rerender } = render(
      <AsyncStatusGate
        status={pendingStatus}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    rerender(
      <AsyncStatusGate
        status={secondaryStatus}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).not.toBeNull();
    expect(screen.queryByText("value-first")).not.toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders pending content when status represents processing after error", async () => {
    // Arrange
    const secondaryStatus = process(fail(pendingStatus, "first"));
    // Act
    const { rerender } = render(
      <AsyncStatusGate
        status={pendingStatus}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    rerender(
      <AsyncStatusGate
        status={secondaryStatus}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).not.toBeNull();
    expect(screen.queryByText("value-first")).toBeNull();
    expect(screen.queryByText("error-first")).toBeNull();
  });

  it("renders error over value content when status represents error after success", async () => {
    // Arrange
    const secondaryStatus = fail(
      process(succeed<string, string>("first")),
      "second",
    );
    // Act
    const { rerender } = render(
      <AsyncStatusGate
        status={pendingStatus}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    rerender(
      <AsyncStatusGate
        status={secondaryStatus}
        errorContent={renderError}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
    expect(screen.queryByText("value-first")).not.toBeNull();
    expect(screen.queryByText("error-second")).not.toBeNull();
  });

  it("renders result of `pendingContent` when it's a function", async () => {
    // Arrange
    // Act
    const { rerender } = render(
      <AsyncStatusGate
        status={pendingStatus}
        errorContent={renderError}
        pendingContent={renderPendingFunction}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).not.toBeNull();
  });

  it("renders no pending content when `pendingContent` is omitted", async () => {
    // Arrange
    // Act
    const { rerender } = render(
      <AsyncStatusGate
        status={pendingStatus}
        errorContent={renderError}
        pendingContent={undefined}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    // Assert
    expect(screen.queryByText("pending")).toBeNull();
  });

  it("renders no error content when `errorContent` is omitted", async () => {
    // Arrange
    const secondaryStatus = fail(pendingStatus, "first");
    // Act
    const { rerender } = render(
      <AsyncStatusGate
        status={secondaryStatus}
        errorContent={undefined}
        pendingContent={renderPendingFlat}
      >
        {renderValue}
      </AsyncStatusGate>,
    );
    // Assert
    expect(screen.queryByText("error-first")).toBeNull();
  });
});
