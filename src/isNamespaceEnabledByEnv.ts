/**
 * Determine whether a namespace is enabled according to a list of
 * environment-configured namespace roots.
 *
 * Special handling:
 * - An empty list means "all namespaces disabled".
 * - A list containing `"*"` means "all namespaces enabled".
 *
 * @param namespace         Full namespace of the logger.
 * @param enabledNamespaces List of enabled namespace roots.
 * @returns `true` if the namespace should be enabled, otherwise `false`.
 */
export function isNamespaceEnabledByEnv(
  namespace: string,
  enabledNamespaces: string[],
): boolean {
  if (enabledNamespaces.length === 0)
    return false
  if (enabledNamespaces.includes('*'))
    return true

  const root = namespace.split(':')[0]
  return enabledNamespaces.includes(root)
}
