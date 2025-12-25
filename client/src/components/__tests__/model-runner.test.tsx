import { describe, expect, vi, beforeEach, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { pipeline } from "@huggingface/transformers";
import { ModelRunner } from "../model-runner";

const mutateMock = vi.fn();

vi.mock("@huggingface/transformers", () => ({
  pipeline: vi.fn(),
}));

vi.mock("@/hooks/use-operations", () => ({
  useCreateOperation: () => ({
    mutate: mutateMock,
  }),
}));

const mockedPipeline = vi.mocked(pipeline);

describe("ModelRunner", () => {
  beforeEach(() => {
    mutateMock.mockClear();
    mockedPipeline.mockClear();
  });

  it("runs the pipeline and persists the result", async () => {
    const inferenceResult = [{ label: "POSITIVE", score: 0.95 }];
    const pipeMock = vi.fn().mockResolvedValue(inferenceResult);
    (mockedPipeline as any).mockResolvedValue(pipeMock);

    render(<ModelRunner />);

    const user = userEvent.setup();
    const input = screen.getByPlaceholderText(/enter text here/i);
    await user.type(input, "test input");

    const runButton = screen.getByRole("button", { name: /run model/i });
    await user.click(runButton);

    await waitFor(() => {
      expect(pipeMock).toHaveBeenCalledWith("test input");
    });

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith({
        task: "sentiment-analysis",
        input: "test input",
        output: inferenceResult,
      });
    });

    await screen.findByText(/POSITIVE/);
  });
});
