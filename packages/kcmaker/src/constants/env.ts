export interface EnvironmentOption {
  title: Kcmaker.EnvironmentValue;
  value: Kcmaker.EnvironmentValue;
  fileSuffix: string;
}

export const ENVIRONMENTS: Record<Kcmaker.EnvironmentValue, EnvironmentOption> = {
  development: { title: "development", value: "development", fileSuffix: "dev" },
  staging: { title: "staging", value: "staging", fileSuffix: "stg" },
  production: { title: "production", value: "production", fileSuffix: "prod" },
} as const;
