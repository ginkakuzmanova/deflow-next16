import { afterEach, describe, expect, it, vi } from "vitest";

import { assignBadges, cn, formatNumber, getDeviconClassName, getTechDescription, getTimeStamp, processJobTitle } from "./utils";

describe("utils", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("merges classes and keeps last conflicting Tailwind class", () => {
    expect(cn("px-2", "text-sm", "px-4")).toBe("text-sm px-4");
  });

  it("maps technologies to devicon class names and falls back", () => {
    expect(getDeviconClassName("Next.js")).toBe("devicon-nextjs-plain colored");
    expect(getDeviconClassName("Unknown Tech")).toBe("devicon-devicon-plain colored");
  });

  it("returns known and fallback tech descriptions", () => {
    expect(getTechDescription("React")).toContain("component-based");
    expect(getTechDescription("SomeTool")).toBe(
      "SomeTool is a technology or tool widely used in software development, providing valuable features and capabilities."
    );
  });

  it("formats numbers for plain, thousand, and million ranges", () => {
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1500)).toBe("1.5K");
    expect(formatNumber(1250000)).toBe("1.3M");
  });

  it("returns relative timestamps", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    expect(getTimeStamp(new Date("2025-12-31T23:59:40Z"))).toBe("20 seconds ago");
    expect(getTimeStamp(new Date("2025-12-31T23:30:00Z"))).toBe("30 mins ago");
    expect(getTimeStamp(new Date("2025-12-31T18:00:00Z"))).toBe("6 hours ago");
    expect(getTimeStamp(new Date("2025-12-29T00:00:00Z"))).toBe("3 days ago");
  });

  it("assigns badge counts based on criteria thresholds", () => {
    const result = assignBadges({
      criteria: [
        { type: "QUESTION_COUNT", count: 120 },
        { type: "TOTAL_VIEWS", count: 10000 },
        { type: "ANSWER_UPVOTES", count: 9 },
      ],
    });

    expect(result).toEqual({
      GOLD: 1,
      SILVER: 2,
      BRONZE: 2,
    });
  });

  it("processes job title and filters null-like words", () => {
    expect(processJobTitle(undefined)).toBe("No Job Title");
    expect(processJobTitle("Senior undefined null Engineer")).toBe("Senior Engineer");
    expect(processJobTitle("undefined null")).toBe("No Job Title");
  });
});
