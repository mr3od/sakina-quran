import { renderHook, act } from "@testing-library/react-native";
import { useDebouncedValue } from "../useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("returns initial value immediately", async () => {
    const { result } = await renderHook(() => useDebouncedValue("test"));
    expect(result.current).toBe("test");
  });

  it("debounces value changes", async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: "initial" } },
    );

    expect(result.current).toBe("initial");

    await rerender({ value: "updated" });
    expect(result.current).toBe("initial");

    await act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe("updated");
  });

  it("cancels previous timeout on rapid changes", async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );

    await rerender({ value: "b" });
    await act(() => {
      jest.advanceTimersByTime(100);
    });

    await rerender({ value: "c" });
    await act(() => {
      jest.advanceTimersByTime(100);
    });

    await rerender({ value: "d" });
    await act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe("d");
  });

  it("uses custom delay", async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 500),
      { initialProps: { value: "initial" } },
    );

    await rerender({ value: "updated" });
    await act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("initial");

    await act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe("updated");
  });
});
