export interface EnvironmentOption {
  title: reno.EnvironmentValue;
  value: reno.EnvironmentValue;
  fileSuffix: string;
}

export const ENVIRONMENTS: EnvironmentOption[] = [
  { title: "development", value: "development", fileSuffix: "dev" },
  { title: "staging", value: "staging", fileSuffix: "stg" },
  { title: "production", value: "production", fileSuffix: "prod" },
] as const;
