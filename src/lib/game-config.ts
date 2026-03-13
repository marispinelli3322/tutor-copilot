/**
 * Game Config Pattern — encapsulates all game-specific configuration.
 * Each game type (hospital, esg) has its own config file.
 */

import type { hospitalConfig } from "./game-configs/hospital";
import type { esgConfig } from "./game-configs/esg";

export type GameType = "hospital" | "esg";

export interface ModuleDefinition {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  href: string;
}

export interface StrategyItem {
  name: string;
  code: string;
}

export interface GovernanceComponent {
  key: string;
  code: string;
  labelKey: string;
}

export interface ProductDefinition {
  key: string;
  name: string;
  suffix: string;
}

export interface ServiceDefinition {
  key: string;
  label: string;
  suffix: string;
  attended?: string;
  demand?: string;
  limit?: string | null;
  lost?: string;
  hasIdleness?: boolean;
}

export interface GameConfig {
  type: GameType;
  periodLabel: string;
  periodLabelShort: string;
  maxPeriods: number;
  nameFilter: string; // SQL LIKE pattern for jogo.nome
  products: ProductDefinition[];
  services: ServiceDefinition[];
  modules: ModuleDefinition[];
  codes: {
    efficiency: readonly string[];
    profitability: readonly string[];
    benchmarking: readonly string[];
    timeseries: readonly string[];
    financialRisk: readonly string[];
    strategyResults: readonly string[];
    governance: readonly string[];
    pricingDecisions: readonly string[];
    pricingResults: readonly string[];
    quality: readonly string[];
    lostRevenue: readonly string[];
    environmental?: readonly string[];
    inventory?: readonly string[];
  };
  strategyItems: StrategyItem[];
  governanceComponents: GovernanceComponent[];
  convenios?: readonly string[];
  servicesPricing?: readonly { key: string; suffix: string }[];
  squadPrompt: string;
}

/**
 * Detect game type from jogo.nome
 */
export function detectGameType(jogoNome: string): GameType {
  if (!jogoNome) return "hospital";
  const lower = jogoNome.toLowerCase();
  if (lower.includes("esg") || lower.includes("neg")) return "esg";
  return "hospital";
}

/**
 * Get config for a game type
 */
export function getGameConfig(type: GameType): GameConfig {
  if (type === "esg") {
    const { esgConfig } = require("./game-configs/esg");
    return esgConfig;
  }
  const { hospitalConfig } = require("./game-configs/hospital");
  return hospitalConfig;
}

/**
 * Get the SQL LIKE filter for a game type, or null for all games
 */
export function getGameFilter(type?: GameType): string | null {
  if (!type) return null;
  return getGameConfig(type).nameFilter;
}
