import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const TypingBubble = () => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn("max-w-[60%] my-2 self-start text-gray-900")}
    >
      <div
        className={cn(
          'bg-gray-200 px-4 py-3 rounded-full inline-flex items-center justify-center space-x-1 rounded-tl-none'
        )}
      >
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="w-2 h-2 bg-gray-600 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{
              repeat: Infinity,
              repeatDelay: 0.4, // ⏸️ brief rest between loops
              duration: 0.6,
              delay: dot * 0.2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default TypingBubble;
