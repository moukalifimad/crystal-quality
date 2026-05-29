export const GRILLE = [
  {
    cat: 'Zones de travail',
    icon: 'ti-armchair',
    items: [
      'Sols propres et sans résidus',
      'Surfaces de travail essuyées',
      'Poubelles vidées et sacs remplacés',
      'Vitres et cloisons sans traces',
    ],
  },
  {
    cat: 'Sanitaires',
    icon: 'ti-droplet',
    items: [
      'Lavabos et robinetterie désinfectés',
      'Sols sanitaires nettoyés et secs',
      'Consommables rechargés (savon, essuie-mains)',
      'Absence d\'odeurs',
    ],
  },
  {
    cat: 'Espaces communs',
    icon: 'ti-building',
    items: [
      'Couloirs et hall dégagés et propres',
      'Accueil / réception impeccable',
      'Salles de réunion rangées et prêtes',
    ],
  },
  {
    cat: 'Contrôle général',
    icon: 'ti-checklist',
    items: [
      'Aucun matériel oublié sur site',
      'Signalement d\'anomalies effectué',
      'Fiche de présence remplie et signée',
      'Respect des horaires d\'intervention',
    ],
  },
]

export const PLANS = {
  'Sols propres et sans résidus': 'Repasser la zone avec serpillière microfibre, vérifier les angles et sous les meubles.',
  'Vitres et cloisons sans traces': 'Appliquer le protocole vitrage avec raclette + spray anti-traces Crystal.',
  'Lavabos et robinetterie désinfectés': 'Utiliser le désinfectant NF T 72-190, laisser poser 2 min avant rinçage.',
  'Sols sanitaires nettoyés et secs': 'Monobrosse + séchage immédiat, panneau "sol glissant" obligatoire.',
  'Absence d\'odeurs': 'Contrôle des siphons, ventilation forcée 15 min + spray neutralisant.',
  'Poubelles vidées et sacs remplacés': 'Vérifier TOUS les bacs y compris dans les espaces de stockage.',
  'Salles de réunion rangées et prêtes': 'Remettre les chaises, effacer les tableaux blancs, ranger les câbles.',
  'Respect des horaires d\'intervention': 'Alerter le responsable opérationnel, noter le retard sur la fiche d\'intervention.',
}

export const TOTAL_CRITERIA = GRILLE.reduce((acc, s) => acc + s.items.length, 0)

export const statusOf = (score) => {
  if (score >= 90) return 'Conforme'
  if (score >= 80) return 'À surveiller'
  return 'Non conforme'
}

export const scoreColor = (score) => {
  if (score >= 90) return '#3B6D11'
  if (score >= 80) return '#854F0B'
  return '#A32D2D'
}

export const scoreBg = (score) => {
  if (score >= 90) return '#EAF3DE'
  if (score >= 80) return '#FAEEDA'
  return '#FCEBEB'
}

export const fmtDate = (d) => {
  if (!d) return '—'
  const parts = d.split('-')
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

export const calcScore = (ratings) => {
  const vals = Object.values(ratings)
  if (!vals.length) return 0
  return Math.round((vals.reduce((a, b) => a + b, 0) / (vals.length * 2)) * 100)
}
