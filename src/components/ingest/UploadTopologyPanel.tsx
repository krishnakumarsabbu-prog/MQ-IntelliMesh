import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderOpen,
  ChevronRight,
  Info,
  Zap,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { uploadTopologyFiles } from '../../lib/api/ingest'
import { ApiRequestError } from '../../lib/api/client'
import { useIngest } from '../../context/IngestContext'

const HACKATHON_COLUMNS = [
  'Discrete Queue Name',
  'ProducerName / ConsumerName',
  'q_manager_name',
  'q_type',
  'app_id',
  'remote_q_mgr_name',
  'xmit_q_name',
]

const NORMALIZED_FILES = [
  { example: 'queue_managers.csv', required: true, note: 'QM names, types, regions' },
  { example: 'queues.csv', required: true, note: 'Queue names, types, owning QM' },
  { example: 'applications.csv', required: true, note: 'App IDs, roles, connected QM' },
  { example: 'channels.csv', required: true, note: 'Channel names, from/to QM' },
  { example: 'relationships.csv', required: false, note: 'Producer/consumer mappings' },
]

const PROCESSING_MESSAGES = [
  'Uploading topology dataset…',
  'Detecting CSV format…',
  'Parsing MQ inventory…',
  'Building canonical topology model…',
  'Validating schema integrity…',
  'Mapping producer/consumer relationships…',
  'Indexing queue manager graph…',
]

const HACKATHON_SIGNATURE_COLS = new Set([
  'discrete queue name',
  'producername',
  'consumername',
  'q_manager_name',
  'primaryapprole',
  'app_id',
  'xmit_q_name',
  'remote_q_mgr_name',
])

function detectFileFormat(file: File): Promise<'hackathon' | 'normalized' | 'unknown'> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const text = (e.target?.result as string) || ''
      const firstLine = text.split('\n')[0] || ''
      const cols = new Set(firstLine.toLowerCase().split(',').map(c => c.trim().replace(/^["']|["']$/g, '')))
      let matched = 0
      HACKATHON_SIGNATURE_COLS.forEach(sig => { if (cols.has(sig)) matched++ })
      resolve(matched >= 5 ? 'hackathon' : 'normalized')
    }
    reader.onerror = () => resolve('unknown')
    reader.readAsText(file.slice(0, 2048))
  })
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface UploadTopologyPanelProps {
  onSuccess?: () => void
}

export default function UploadTopologyPanel({ onSuccess }: UploadTopologyPanelProps) {
  const [files, setFiles] = useState<File[]>([])
  const [detectedFormat, setDetectedFormat] = useState<'hackathon' | 'normalized' | 'mixed' | null>(null)
  const [dragging, setDragging] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)
  const [dupWarning, setDupWarning] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const msgTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { status, error, setUploading, setProcessing, setSuccess, setError } = useIngest()

  const isRunning = status === 'uploading' || status === 'processing'

  const addFiles = useCallback(async (incoming: FileList | File[]) => {
    const csvFiles = Array.from(incoming).filter(f =>
      f.name.toLowerCase().endsWith('.csv') || f.type === 'text/csv' || f.type === 'application/csv'
    )
    const nonCsv = Array.from(incoming).length - csvFiles.length
    if (nonCsv > 0) {
      setDupWarning(`${nonCsv} non-CSV file${nonCsv > 1 ? 's' : ''} ignored. Only .csv files are accepted.`)
      setTimeout(() => setDupWarning(null), 4000)
    }

    let newFiles: File[] = []
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      const unique = csvFiles.filter(f => !names.has(f.name))
      const dups = csvFiles.length - unique.length
      if (dups > 0) {
        setDupWarning(`${dups} duplicate file${dups > 1 ? 's' : ''} skipped.`)
        setTimeout(() => setDupWarning(null), 3000)
      }
      newFiles = [...prev, ...unique]
      return newFiles
    })

    if (csvFiles.length > 0) {
      const formats = await Promise.all(csvFiles.map(detectFileFormat))
      const hasHackathon = formats.includes('hackathon')
      const hasNormalized = formats.includes('normalized')
      if (hasHackathon && !hasNormalized) setDetectedFormat('hackathon')
      else if (hasNormalized && !hasHackathon) setDetectedFormat('normalized')
      else if (hasHackathon && hasNormalized) setDetectedFormat('mixed')
      else setDetectedFormat('normalized')
    }
  }, [])

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
  }, [addFiles])

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const onDragLeave = useCallback(() => setDragging(false), [])

  const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }, [addFiles])

  const removeFile = useCallback((name: string) => {
    setFiles(prev => {
      const next = prev.filter(f => f.name !== name)
      if (next.length === 0) setDetectedFormat(null)
      return next
    })
  }, [])

  const startProcessingMessages = useCallback(() => {
    let i = 0
    setMsgIndex(0)
    msgTimerRef.current = setInterval(() => {
      i = (i + 1) % PROCESSING_MESSAGES.length
      setMsgIndex(i)
    }, 1800)
  }, [])

  const stopProcessingMessages = useCallback(() => {
    if (msgTimerRef.current) {
      clearInterval(msgTimerRef.current)
      msgTimerRef.current = null
    }
  }, [])

  const handleIngest = useCallback(async () => {
    if (files.length === 0 || isRunning) return
    setUploading()
    startProcessingMessages()
    try {
      await new Promise(res => setTimeout(res, 600))
      setProcessing()
      const result = await uploadTopologyFiles(files)
      stopProcessingMessages()
      setSuccess(result)
      onSuccess?.()
    } catch (err) {
      stopProcessingMessages()
      const msg = err instanceof ApiRequestError
        ? err.message
        : 'Failed to ingest topology dataset. Please check your files and try again.'
      setError(msg)
    }
  }, [files, isRunning, setUploading, setProcessing, setSuccess, setError, startProcessingMessages, stopProcessingMessages, onSuccess])

  return (
    <div className="bg-[#0F172A] border border-slate-800/60 rounded-2xl overflow-hidden">
      <div className="px-6 pt-6 pb-5 border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <UploadCloud className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-white">Upload Topology Dataset</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Import your MQ inventory CSV — one file or many, both formats supported</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">

        <div className="grid grid-cols-2 gap-2">
          <div className={`p-3 rounded-xl border transition-all ${
            detectedFormat === 'hackathon'
              ? 'bg-teal-500/10 border-teal-500/30'
              : 'bg-slate-800/20 border-slate-800/50'
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className={`w-3.5 h-3.5 ${detectedFormat === 'hackathon' ? 'text-teal-400' : 'text-slate-500'}`} />
              <span className={`text-[11px] font-semibold ${detectedFormat === 'hackathon' ? 'text-teal-300' : 'text-slate-500'}`}>
                Single-File Format
                {detectedFormat === 'hackathon' && <span className="ml-1.5 text-[9px] font-bold bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded border border-teal-500/30">DETECTED</span>}
              </span>
            </div>
            <p className="text-[10px] text-slate-600 mb-2 leading-relaxed">One denormalized CSV with all queue, app, and relationship data in each row.</p>
            <div className="space-y-0.5">
              {HACKATHON_COLUMNS.slice(0, 4).map(col => (
                <div key={col} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-slate-700 flex-shrink-0" />
                  <span className="text-[9px] font-mono text-slate-600">{col}</span>
                </div>
              ))}
              <div className="text-[9px] text-slate-700 pl-2.5">+ {HACKATHON_COLUMNS.length - 4} more columns…</div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border transition-all ${
            detectedFormat === 'normalized'
              ? 'bg-blue-500/10 border-blue-500/30'
              : 'bg-slate-800/20 border-slate-800/50'
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              <Layers className={`w-3.5 h-3.5 ${detectedFormat === 'normalized' ? 'text-blue-400' : 'text-slate-500'}`} />
              <span className={`text-[11px] font-semibold ${detectedFormat === 'normalized' ? 'text-blue-300' : 'text-slate-500'}`}>
                Multi-File Format
                {detectedFormat === 'normalized' && <span className="ml-1.5 text-[9px] font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">DETECTED</span>}
              </span>
            </div>
            <p className="text-[10px] text-slate-600 mb-2 leading-relaxed">Separate CSV per entity type — one file per object category.</p>
            <div className="space-y-0.5">
              {NORMALIZED_FILES.map(f => (
                <div key={f.example} className="flex items-center gap-1.5">
                  <ChevronRight className="w-2.5 h-2.5 text-slate-700 flex-shrink-0" />
                  <span className="text-[9px] font-mono text-slate-600">{f.example}</span>
                  {f.required && <span className="text-[8px] font-bold text-blue-500/60 uppercase ml-auto">req</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !isRunning && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-7 text-center transition-all duration-200 cursor-pointer group
            ${dragging
              ? 'border-blue-400/60 bg-blue-500/8 scale-[1.01]'
              : isRunning
              ? 'border-slate-700/40 bg-slate-800/10 cursor-not-allowed pointer-events-none'
              : 'border-slate-700/50 hover:border-blue-500/40 hover:bg-blue-500/5'
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            multiple
            onChange={onFileChange}
            className="hidden"
            disabled={isRunning}
          />

          <div className={`w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all
            ${dragging ? 'bg-blue-500/20 scale-110' : 'bg-slate-800/60 group-hover:bg-blue-500/10'}`}
          >
            <FolderOpen className={`w-5 h-5 transition-colors ${dragging ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'}`} />
          </div>

          <p className={`text-[14px] font-medium mb-1 transition-colors ${dragging ? 'text-blue-300' : 'text-slate-300 group-hover:text-white'}`}>
            {dragging ? 'Release to add files' : 'Drop your CSV file(s) here'}
          </p>
          <p className="text-[11px] text-slate-600 mb-3">1 file (hackathon format) or up to 5 files (normalized format)</p>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-[11px] font-mono text-slate-500">
            .csv only — auto-detected
          </span>

          {dragging && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-blue-400/40 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </div>

        <AnimatePresence>
          {dupWarning && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20"
            >
              <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-[12px] text-amber-300">{dupWarning}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-slate-400">
                    {files.length} file{files.length > 1 ? 's' : ''} selected
                  </span>
                  {detectedFormat === 'hackathon' && (
                    <span className="text-[9px] font-bold bg-teal-500/15 text-teal-300 px-2 py-0.5 rounded border border-teal-500/20">
                      Hackathon Format
                    </span>
                  )}
                  {detectedFormat === 'normalized' && (
                    <span className="text-[9px] font-bold bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
                      Normalized Format
                    </span>
                  )}
                  {detectedFormat === 'mixed' && (
                    <span className="text-[9px] font-bold bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                      Mixed Formats
                    </span>
                  )}
                </div>
                {!isRunning && (
                  <button
                    onClick={() => { setFiles([]); setDetectedFormat(null) }}
                    className="text-[11px] text-slate-600 hover:text-rose-400 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {files.map((file, i) => (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30 group/file"
                >
                  <FileText className="w-4 h-4 text-blue-400/70 flex-shrink-0" />
                  <span className="flex-1 text-[12px] font-medium text-slate-300 truncate">{file.name}</span>
                  <span className="text-[11px] font-mono text-slate-600 flex-shrink-0">{formatBytes(file.size)}</span>
                  {!isRunning && (
                    <button
                      onClick={e => { e.stopPropagation(); removeFile(file.name) }}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover/file:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {detectedFormat === 'hackathon' && files.length > 0 && !isRunning && status !== 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-xl bg-teal-500/8 border border-teal-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-[12px] font-semibold text-teal-300">Hackathon format detected</span>
            </div>
            <div className="space-y-1">
              {[
                'Queues extracted from "Discrete Queue Name" column',
                'Producers & consumers extracted from ProducerName / ConsumerName',
                'Queue Managers extracted from q_manager_name',
                'Queue types (Local, Remote, Alias) auto-classified from q_type',
                'Cross-QM routing paths inferred from remote_q_mgr_name + xmit_q_name',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 text-teal-600 mt-0.5 flex-shrink-0" />
                  <span className="text-[10px] text-teal-600/80">{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {isRunning ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex flex-col items-center gap-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={msgIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="text-[13px] font-medium text-blue-300"
                  >
                    {PROCESSING_MESSAGES[msgIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                  initial={{ width: '5%' }}
                  animate={{ width: status === 'processing' ? '85%' : '30%' }}
                  transition={{ duration: 2.5, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[11px] text-slate-600">This may take a few moments depending on dataset size</p>
            </motion.div>
          ) : status === 'error' && error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-start gap-3 px-4 py-3 rounded-xl bg-rose-500/8 border border-rose-500/20"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-medium text-rose-300 mb-0.5">Ingestion Failed</p>
                <p className="text-[12px] text-rose-400/70">{error}</p>
              </div>
            </motion.div>
          ) : status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-emerald-300">Topology ingested successfully</p>
                <p className="text-[11px] text-emerald-500/70 mt-0.5">Estate model built — ready for analysis on the next tab</p>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="cta"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              whileHover={files.length > 0 ? { scale: 1.01 } : {}}
              whileTap={files.length > 0 ? { scale: 0.99 } : {}}
              onClick={handleIngest}
              disabled={files.length === 0}
              className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-[14px] font-semibold transition-all
                ${files.length > 0
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 cursor-pointer'
                  : 'bg-slate-800/50 text-slate-600 border border-slate-700/40 cursor-not-allowed'
                }`}
            >
              <UploadCloud className="w-4 h-4" />
              {files.length === 0 ? 'Select a CSV file to begin' : `Ingest Topology Dataset (${files.length} file${files.length > 1 ? 's' : ''})`}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
