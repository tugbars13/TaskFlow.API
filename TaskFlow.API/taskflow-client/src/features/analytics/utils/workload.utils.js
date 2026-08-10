import { WORKLOAD_LEVEL } from "@/features/analytics/constants/workload.constants";

export function getWorkloadLevel(capacity) {
  if (capacity >= 80) return WORKLOAD_LEVEL.HIGH;

  if (capacity >= 50) return WORKLOAD_LEVEL.MEDIUM;

  return WORKLOAD_LEVEL.LOW;
}
