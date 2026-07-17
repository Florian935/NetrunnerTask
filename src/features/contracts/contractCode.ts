/**
 * Code hexa court, décoratif et déterministe, dérivé de l'id d'un contrat
 * (affichage seul, ex. « 0x4F »). Sert de marqueur in-world dans la liste.
 */
export function contractCode(id: string): string {
  const hex = id.replace(/[^0-9a-f]/gi, '').slice(0, 2).toUpperCase()
  return `0x${hex || '00'}`
}
