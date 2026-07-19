import { useContractsStore } from '../../stores/useContractsStore'
import { useFactionsStore } from '../../stores/useFactionsStore'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { ContractDetail } from './ContractDetail'

export interface ContractDetailConnectedProps {
  /** Contrat à afficher ; `null` = modale fermée. */
  contractId: string | null
  onClose: () => void
}

/**
 * `ContractDetail` câblé au store des contrats. Trouve le contrat **live**
 * (reflète les maj) et relie les actions d'édition. Partagé par la liste et le
 * HUD (US-010) pour éviter de dupliquer le câblage.
 */
export function ContractDetailConnected({
  contractId,
  onClose,
}: ContractDetailConnectedProps) {
  const contracts = useContractsStore((s) => s.contracts)
  const factions = useFactionsStore((s) => s.factions)
  const rename = useContractsStore((s) => s.rename)
  const setDifficulty = useContractsStore((s) => s.setDifficulty)
  const setFaction = useContractsStore((s) => s.setFaction)
  const setPriority = useContractsStore((s) => s.setPriority)
  const setDueDate = useContractsStore((s) => s.setDueDate)
  const setRecurrence = useContractsStore((s) => s.setRecurrence)
  const setReminderLead = useContractsStore((s) => s.setReminderLead)
  const setStake = useContractsStore((s) => s.setStake)
  const balance = usePlayerStore((s) => s.player?.credits ?? 0)
  const addSubtask = useContractsStore((s) => s.addSubtask)
  const toggleSubtask = useContractsStore((s) => s.toggleSubtask)
  const removeSubtask = useContractsStore((s) => s.removeSubtask)

  const contract = contractId
    ? (contracts.find((c) => c.id === contractId) ?? null)
    : null
  if (!contract) return null

  return (
    <ContractDetail
      contract={contract}
      factions={factions}
      balance={balance}
      onRename={rename}
      onSetDifficulty={setDifficulty}
      onSetFaction={setFaction}
      onSetPriority={setPriority}
      onSetDueDate={setDueDate}
      onSetRecurrence={setRecurrence}
      onSetReminderLead={setReminderLead}
      onSetStake={setStake}
      onAddSubtask={addSubtask}
      onToggleSubtask={toggleSubtask}
      onRemoveSubtask={removeSubtask}
      onClose={onClose}
    />
  )
}
