import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

interface Props {
  onLaunch: () => void
}

export default function Navbar({ onLaunch }: Props) {
  return (
    <motion.nav
      className="relative z-20 px-6 py-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
        {/* Left */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-white" strokeWidth={1.5} />
            <span className="font-body font-semibold text-white tracking-wider text-sm">
              POSESENSE
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'Technology', 'About'].map(item => (
              <a
                key={item}
                href="#"
                className="font-body text-white/70 hover:text-white transition-colors text-sm"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <button className="font-body text-white/70 hover:text-white transition-colors text-sm hidden md:block">
            GitHub
          </button>
          <motion.button
            onClick={onLaunch}
            className="liquid-glass rounded-full px-6 py-2 font-body text-white text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Launch System
          </motion.button>
        </div>
      </div>
    </motion.nav>
)
}