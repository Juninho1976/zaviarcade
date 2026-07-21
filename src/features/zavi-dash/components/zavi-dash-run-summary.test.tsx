import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "@/features/zavi-dash/application/game-engine";
import { zaviDashLevelOne } from "@/features/zavi-dash/data/zavi-dash-level-one";
import { ZaviDashRunSummary } from "./zavi-dash-run-summary";

const onPlayerNameChange = () => undefined;
const onRestart = () => undefined;
const onSubmit = () => undefined;

describe("ZaviDashRunSummary", () => {
  it("shows a distinct death state with a player-name form and restart action", () => {
    const state = { ...createInitialGameState(zaviDashLevelOne), phase: "dead" as const, deathReason: "gap" as const, score: 120 };
    const markup = renderToStaticMarkup(
      <ZaviDashRunSummary onPlayerNameChange={onPlayerNameChange} onRestart={onRestart} onSubmit={onSubmit} playerName="Zavi" state={state} submission={{ status: "idle" }} />,
    );

    expect(markup).toContain("Run ended");
    expect(markup).toContain("Player name");
    expect(markup).toContain("Restart run");
    expect(markup).not.toContain("Save score");
  });

  it("shows a distinct completed state with the final score", () => {
    const state = { ...createInitialGameState(zaviDashLevelOne), phase: "completed" as const, progress: 1, score: 1_087 };
    const markup = renderToStaticMarkup(
      <ZaviDashRunSummary onPlayerNameChange={onPlayerNameChange} onRestart={onRestart} onSubmit={onSubmit} playerName="Zavi" state={state} submission={{ status: "idle" }} />,
    );

    expect(markup).toContain("Level complete");
    expect(markup).toContain("1,087");
    expect(markup).toContain("Player name");
    expect(markup).toContain("Save score");
  });
});
