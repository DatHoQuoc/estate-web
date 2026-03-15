export const FINANCE_ROUTES = {
  root: "/finance",
  reconciliation: "/finance/reconciliation",
  audit: "/finance/audit",
  reports: "/finance/reports",
  reportById: (id: number | string) => `/finance/reports/${id}`,
} as const;
