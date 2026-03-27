import { ShieldCheck, RefreshCcw, GitBranch, Lock } from 'lucide-react'

const notes = [
  {
    icon: ShieldCheck,
    text: 'All artifacts are generated exclusively from the validated target-state topology model.',
  },
  {
    icon: GitBranch,
    text: 'Export packs preserve full transformation traceability — every decision is referenced by ID.',
  },
  {
    icon: RefreshCcw,
    text: 'Artifacts are deterministic and reproducible — regeneration produces identical outputs from the same model version.',
  },
  {
    icon: Lock,
    text: 'Outputs are suitable for downstream automation, governance workflows, and enterprise change management.',
  },
]

export default function ExportNotesFooter() {
  return (
    <div className="bg-slate-900/20 border border-slate-800/40 rounded-2xl px-5 py-4">
      <div className="flex flex-wrap gap-x-8 gap-y-2.5">
        {notes.map((note, i) => {
          const Icon = note.icon
          return (
            <div key={i} className="flex items-start gap-2 min-w-0">
              <Icon className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 leading-relaxed">{note.text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
