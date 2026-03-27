import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, User, Sparkles } from 'lucide-react'
import { chatHistory, suggestedPrompts } from '../../data/explainabilityData'
import type { ChatMessage } from '../../data/explainabilityData'
import AIResponseCard from './AIResponseCard'

const quickReplies: Record<string, Partial<ChatMessage>> = {
  'Which queue managers are highest risk?': {
    id: 'dyn-1',
    role: 'assistant',
    text: 'Analysis already available. Scroll up to see the risk assessment for HUB-QM-01 (84/100), INT-QM-02 (71/100), and APP-QM-02 (58/100) from the active transformation context.',
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    confidence: 92,
    tags: ['Risk Analysis'],
  },
  'Show all policy violations resolved.': {
    id: 'dyn-2',
    role: 'assistant',
    text: 'The transformation resolves 18 policy violations across 3 categories.',
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    bullets: [
      'PP-007 compliance: Dead-letter queues added to HUB-QM-01, INT-QM-02, APP-QM-02 (3 violations resolved).',
      'GP-114 isolation: APP_BILLING and APP_PAYMENTS now on dedicated QMs (2 violations resolved).',
      'Naming convention enforcement: 13 objects renamed to follow DOMAIN.APP.DIRECTION schema.',
    ],
    impact: 'Policy compliance rate moves from 61% to 100% across all measured dimensions.',
    confidence: 100,
    tags: ['Policy Enforcement', 'Compliance'],
  },
  'What happens if I add a new application?': {
    id: 'dyn-3',
    role: 'assistant',
    text: 'Impact depends heavily on target placement. Based on current topology, here is the risk profile for the two most likely scenarios.',
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    bullets: [
      'If placed on a shared QM (e.g., QM_PAYMENTS): +8 complexity pts, +14% policy burden, multi-QM ownership violation likely.',
      'If placed on a new dedicated QM: +2 complexity pts, zero policy violations, preferred for compliance-sensitive applications.',
      'Recommendation: provision dedicated QM for any application handling financial or PII data. Use shared QMs only for stateless routing or monitoring workloads.',
    ],
    impact: 'Dedicated QM provisioning adds ~7% infra cost but eliminates governance risk entirely.',
    confidence: 87,
    tags: ['Simulation', 'App Assignment'],
  },
}

function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 justify-end"
    >
      <div className="max-w-[75%]">
        <div className="flex items-center justify-end gap-2 mb-1.5">
          <span className="text-[10px] text-slate-700">{message.timestamp}</span>
          <span className="text-[11px] font-semibold text-slate-500">You</span>
        </div>
        <div className="bg-blue-600/20 border border-blue-500/25 rounded-xl rounded-tr-none px-4 py-2.5">
          <p className="text-[13px] text-slate-200">{message.text}</p>
        </div>
      </div>
      <div className="flex-shrink-0 mt-1">
        <div className="w-7 h-7 rounded-lg bg-slate-700/60 border border-slate-600/30 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </motion.div>
  )
}

export default function CopilotChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function handleSend(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const reply = quickReplies[trimmed]
      const aiMsg: ChatMessage = reply
        ? { ...reply, id: `ai-${Date.now()}`, role: 'assistant' } as ChatMessage
        : {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            text: 'I have analysed the transformation context for this query. The relevant decision records are being retrieved from the reasoning engine — the data pipeline shows this as a supported query pattern. Please check the Decision Explorer below for structured details on this topic.',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            confidence: 82,
            tags: ['General Query'],
          }
      setMessages(prev => [...prev, aiMsg])
    }, 1100)
  }

  return (
    <div className="bg-[#0D1117] border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col h-full" style={{ minHeight: 560 }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 bg-[#0F1520]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-violet-400" />
          </div>
          <span className="text-[13px] font-semibold text-slate-200">Architecture Assistant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[10px] text-violet-400 font-semibold">Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5" style={{ maxHeight: 440 }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) =>
            msg.role === 'user'
              ? <UserBubble key={msg.id} message={msg} />
              : <AIResponseCard key={msg.id} message={msg} delay={i === messages.length - 1 ? 0.1 : 0} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div className="bg-[#161D2C] border border-slate-700/40 rounded-xl rounded-tl-none px-4 py-3">
                <div className="flex items-center gap-1.5">
                  {[0, 0.15, 0.3].map(d => (
                    <motion.div
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-violet-400"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 0.8, delay: d, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-2 pt-1 border-t border-slate-800/40">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {suggestedPrompts.slice(0, 4).map(p => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-violet-300 hover:border-violet-500/30 hover:bg-violet-500/8 transition-all truncate max-w-[200px]"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask the copilot about any transformation decision..."
            className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-xl px-3.5 py-2.5 text-[12px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-violet-600/80 hover:bg-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-violet-500/30"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
