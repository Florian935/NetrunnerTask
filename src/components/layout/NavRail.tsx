import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
import { Icon } from '../ui'
import './appShell.css'

/** Destinations actives (routées). */
const ROUTES = [
  {
    to: '/',
    icon: 'layout-dashboard',
    code: 'nav.dashboardCode',
    label: 'nav.dashboard',
    end: true,
  },
  {
    to: '/contracts',
    icon: 'crosshair',
    code: 'nav.contractsCode',
    label: 'nav.contracts',
    end: false,
  },
  {
    to: '/network',
    icon: 'share-2',
    code: 'nav.networkCode',
    label: 'nav.network',
    end: false,
  },
  {
    to: '/wardrobe',
    icon: 'shirt',
    code: 'nav.wardrobeCode',
    label: 'nav.wardrobe',
    end: false,
  },
] as const

/** Destinations à venir (MVP 2/3), affichées désactivées. `hideMobile` = masquée
 *  sur la barre inférieure étroite. */
const FUTURE = [
  { icon: 'trending-up', label: 'nav.progression', hideMobile: false },
  { icon: 'box', label: 'nav.crates', hideMobile: true },
] as const

/**
 * Rail de navigation de l'app-shell (US-010). Rail latéral sur desktop, barre
 * inférieure sur mobile (voir `appShell.css`). Les destinations actives sont des
 * `NavLink` (état actif stylé) ; les futures sont grisées et non cliquables.
 */
export function NavRail() {
  const { t } = useTranslation()
  const soon = t('nav.soon')

  return (
    <nav className="nav-rail">
      <div className="nav-brand">NW//</div>

      {ROUTES.map((r) => (
        <NavLink
          key={r.to}
          to={r.to}
          end={r.end}
          title={t(r.label)}
          className={({ isActive }) =>
            `nav-item${isActive ? ' nav-item--active' : ''}`
          }
        >
          <Icon name={r.icon} size={18} />
          <span>{t(r.code)}</span>
        </NavLink>
      ))}

      <div className="nav-sep" />

      {FUTURE.map((f) => (
        <div
          key={f.label}
          className={`nav-item nav-item--future${f.hideMobile ? ' nav-hide-mobile' : ''}`}
          title={`${t(f.label)} — ${soon}`}
        >
          <Icon name={f.icon} size={18} color="var(--steel-600)" />
        </div>
      ))}

      <div className="nav-spacer" />

      <div
        className="nav-item nav-item--future"
        title={`${t('nav.profile')} — ${soon}`}
      >
        <Icon name="user" size={18} color="var(--steel-600)" />
      </div>
    </nav>
  )
}
