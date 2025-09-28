import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";
import Pomodoro from "../pomodoro";

describe("Pomodoro", () => {
  it("shows default 25:00 and counts down after start", async () => {
    vi.useFakeTimers();
    render(<Pomodoro />);
    expect(screen.getByText(/25:00/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /start/i }));
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/24:59/)).toBeInTheDocument();
    vi.useRealTimers();
  });
});
