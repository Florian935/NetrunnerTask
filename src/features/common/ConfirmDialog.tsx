import { useEffect } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { Button, HudPanel, Icon } from '../../components/ui'

export interface ConfirmDialogProps {
  title: ReactNode
  status?: ReactNode
  message: ReactNode
  /** Rappel de l'élément concerné (optionnel) : légende + libellé. */
  itemCaption?: ReactNode
  itemLabel?: ReactNode
  /** Icône en tête du message (registre Lucide). @default "shield-alert" */
  icon?: string
  /** Couleur de l'icône. @default "var(--red-500)" */
  iconColor?: string
  /**
   * Contenu libre inséré entre le bloc `itemLabel` et les boutons (US-024 :
   * grille « Perdu / Conservé » de la renaissance). Optionnel.
   */
  children?: ReactNode
  cancelLabel: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}

/**
 * Popup de confirmation (destructive) : overlay void flouté + `HudPanel` magenta.
 * Clic hors du panneau ou touche Échap = annuler. NIGHTWIRE n'a pas de composant
 * modal → on compose ici à partir du `HudPanel` du design system.
 */
export function ConfirmDialog({
  title,
  status,
  message,
  itemCaption,
  itemLabel,
  icon = 'shield-alert',
  iconColor = 'var(--red-500)',
  children,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const stop = (e: MouseEvent) => e.stopPropagation()

  return (
    <div
      className="nw-overlay-in"
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'rgba(5,6,10,.74)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
    >
      <div
        className="nw-modal-in"
        onClick={stop}
        style={{ width: 404, maxWidth: '100%' }}
      >
        <HudPanel accent="magenta" title={title} status={status}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: iconColor, flex: 'none', marginTop: 1 }}>
                <Icon name={icon} size={22} color={iconColor} />
              </span>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-md)',
                  lineHeight: 1.45,
                  color: 'var(--steel-200)',
                }}
              >
                {message}
              </p>
            </div>
            {itemLabel && (
              <div
                style={{
                  padding: '11px 13px',
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--border)',
                  clipPath: 'var(--clip-bevel-sm)',
                }}
              >
                {itemCaption && (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-2xs)',
                      letterSpacing: '0.14em',
                      color: 'var(--steel-600)',
                      marginBottom: 4,
                    }}
                  >
                    {itemCaption}
                  </div>
                )}
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-md)',
                    color: 'var(--frost-100)',
                  }}
                >
                  {itemLabel}
                </div>
              </div>
            )}
            {children}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="ghost" size="md" onClick={onCancel}>
                {cancelLabel}
              </Button>
              <Button variant="danger" size="md" hud onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </div>
          </div>
        </HudPanel>
      </div>
    </div>
  )
}
