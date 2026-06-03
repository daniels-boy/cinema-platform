export interface HotTake {
  id: string;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const HOT_TAKES: HotTake[] = [
  { 
    id: "chorei_baldes", 
    label: "Chorei baldes", 
    emoji: "😭", 
    color: "#3b82f6", 
    bgColor: "rgba(59, 130, 246, 0.12)", 
    borderColor: "rgba(59, 130, 246, 0.25)" 
  },
  { 
    id: "dormi_no_meio", 
    label: "Dormi no meio", 
    emoji: "😴", 
    color: "#94a3b8", 
    bgColor: "rgba(148, 163, 184, 0.12)", 
    borderColor: "rgba(148, 163, 184, 0.25)" 
  },
  { 
    id: "final_explode_cabeca", 
    label: "Final explode-cabeça", 
    emoji: "🤯", 
    color: "#e8b44b", 
    bgColor: "rgba(232, 180, 75, 0.12)", 
    borderColor: "rgba(232, 180, 75, 0.25)" 
  },
  { 
    id: "sessao_da_tarde", 
    label: "Passou na Sessão da Tarde", 
    emoji: "🍿", 
    color: "#a855f7", 
    bgColor: "rgba(168, 85, 247, 0.12)", 
    borderColor: "rgba(168, 85, 247, 0.25)" 
  },
  { 
    id: "vilao_tinha_razao", 
    label: "Vilão tinha razão", 
    emoji: "😈", 
    color: "#ef4444", 
    bgColor: "rgba(239, 68, 68, 0.12)", 
    borderColor: "rgba(239, 68, 68, 0.25)" 
  },
  { 
    id: "puro_cinema", 
    label: "Puro cinema", 
    emoji: "🎬", 
    color: "#22c55e", 
    bgColor: "rgba(34, 197, 94, 0.12)", 
    borderColor: "rgba(34, 197, 94, 0.25)" 
  },
  { 
    id: "banger_supremo", 
    label: "Banger Supremo", 
    emoji: "🔥", 
    color: "#f97316", 
    bgColor: "rgba(249, 115, 22, 0.12)", 
    borderColor: "rgba(249, 115, 22, 0.25)" 
  },
  { 
    id: "preguica_demais", 
    label: "Preguiça / Flop", 
    emoji: "🥱", 
    color: "#6b7280", 
    bgColor: "rgba(107, 114, 128, 0.12)", 
    borderColor: "rgba(107, 114, 128, 0.25)" 
  }
];
