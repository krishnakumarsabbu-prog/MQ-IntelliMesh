import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'
import WorkflowProgress from './WorkflowProgress'
import { useDemo } from '../../context/DemoContext'
import { useTheme } from '../../context/ThemeContext'

export default function AppShell() {
  const { ceoMode } = useDemo()
  const { isDark } = useTheme()

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#080D18]' : 'bg-[#F0F4F8]'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader />
        <WorkflowProgress />
        <AnimatePresence>
          {ceoMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-amber-500/8 border-b border-amber-500/20 px-6 py-2 flex items-center gap-3 flex-shrink-0 overflow-hidden"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
              <span className="text-[11px] font-semibold text-amber-300">Presentation Mode Active</span>
              <span className="text-[11px] text-amber-400/60">— MQ IntelliMesh · AI-Powered Topology Transformation Platform</span>
            </motion.div>
          )}
        </AnimatePresence>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
