import { renderHook } from "@testing-library/react-native";
import { useSearchController } from "../useSearchController";
import { makeRow } from "../../__tests__/fixtures";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

jest.mock("../useSearchQuery");
const { useSearchQuery } = jest.requireMock("../useSearchQuery");

describe("useSearchController", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns "entry" for empty query', async () => {
    useSearchQuery.mockReturnValue({
      data: undefined,
      isFetching: false,
      isError: false,
    });

    const { result } = await renderHook(() => useSearchController(""), { wrapper });

    expect(result.current).toEqual({ kind: "entry" });
  });

  it('returns "loading" when fetching with no data', async () => {
    useSearchQuery.mockReturnValue({
      data: undefined,
      isFetching: true,
      isError: false,
    });

    const { result } = await renderHook(() => useSearchController("test"), {
      wrapper,
    });

    expect(result.current).toEqual({ kind: "loading" });
  });

  it('returns "error" on error', async () => {
    useSearchQuery.mockReturnValue({
      data: undefined,
      isFetching: false,
      isError: true,
      error: new Error("Network error"),
    });

    const { result } = await renderHook(() => useSearchController("test"), {
      wrapper,
    });

    expect(result.current).toEqual({ kind: "error", message: "Network error" });
  });

  it('returns "empty" when no results', async () => {
    useSearchQuery.mockReturnValue({
      data: [],
      isFetching: false,
      isError: false,
    });

    const { result } = await renderHook(() => useSearchController("test"), {
      wrapper,
    });

    expect(result.current).toEqual({ kind: "empty" });
  });

  it('returns "results" with data', async () => {
    const rows = [makeRow({ sura: 1, ayah: 1 })];
    useSearchQuery.mockReturnValue({
      data: rows,
      isFetching: false,
      isError: false,
    });

    const { result } = await renderHook(() => useSearchController("test"), {
      wrapper,
    });

    expect(result.current).toEqual({ kind: "results", items: rows });
  });

  it("shows previous results while fetching new ones", async () => {
    const rows = [makeRow({ sura: 1, ayah: 1 })];
    useSearchQuery.mockReturnValue({
      data: rows,
      isFetching: true,
      isError: false,
    });

    const { result } = await renderHook(() => useSearchController("test"), {
      wrapper,
    });

    expect(result.current).toEqual({ kind: "results", items: rows });
  });
});
