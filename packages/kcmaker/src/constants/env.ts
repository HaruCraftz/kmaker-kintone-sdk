export interface EnvironmentOption {
  title: reno.EnvironmentValue;
  value: reno.EnvironmentValue;
  fileSuffix: string;
}

export const ENVIRONMENTS: Record<reno.EnvironmentValue, EnvironmentOption> = {
  development: { title: "development", value: "development", fileSuffix: "dev" },
  staging: { title: "staging", value: "staging", fileSuffix: "stg" },
  production: { title: "production", value: "production", fileSuffix: "prod" },
} as const;
