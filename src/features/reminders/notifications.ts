// US-014 — accès aux notifications système, avec **dégradation propre** :
// tout est no-op / 'unsupported' si l'API `Notification` n'existe pas
// (navigateurs restreints, iOS hors PWA installée). Aucune exception levée.

export type PermissionState = 'granted' | 'denied' | 'default' | 'unsupported'

/** L'API Notification est-elle disponible ? */
export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

/** État courant de la permission (ou `'unsupported'`). */
export function getPermission(): PermissionState {
  if (!notificationsSupported()) return 'unsupported'
  return Notification.permission as PermissionState
}

/**
 * Demande la permission (déclenchée par une action utilisateur, US-014 H4).
 * Renvoie l'état résultant ; `'unsupported'` si l'API est absente.
 */
export async function requestPermission(): Promise<PermissionState> {
  if (!notificationsSupported()) return 'unsupported'
  try {
    return (await Notification.requestPermission()) as PermissionState
  } catch {
    // Anciennes API à callback / refus silencieux → on relit l'état courant.
    return getPermission()
  }
}

/**
 * Émet une notification système si la permission est accordée. No-op sinon
 * (l'appelant garde le repli in-app). N'échoue jamais.
 */
export function notify(title: string, body: string): void {
  if (getPermission() !== 'granted') return
  try {
    // eslint-disable-next-line no-new
    new Notification(title, { body })
  } catch {
    // Certaines plateformes exigent le service worker → repli silencieux.
  }
}
