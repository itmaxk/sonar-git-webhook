export function normalizeMrAction(action: string | undefined): string {
  if (!action) {
    return 'unknown'
  }

  const normalized = action.trim().toLowerCase()

  if (normalized === 'open') return 'opened'
  if (normalized === 'reopen') return 'reopened'
  if (normalized === 'update') return 'updated'

  return normalized
}

export function isProcessableAction(action: string | undefined): boolean {
  const normalized = normalizeMrAction(action)
  return normalized === 'opened' || normalized === 'reopened' || normalized === 'updated'
}