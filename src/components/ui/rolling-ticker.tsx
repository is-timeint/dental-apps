'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const RollingNumberTicker: React.FC<{
  value: number;
  prefix?: string;
  className?: string;
}> = ({ value, prefix = 'Rp ', className = '' }) => {
  const formatted = value.toLocaleString('id-ID');

  return (
    <div className={`flex items-center text-xl font-bold font-mono tracking-tight text-text-primary overflow-hidden h-7 ${className}`}>
      {prefix && <span>{prefix}</span>}
      <div className="flex overflow-hidden">
        {formatted.split('').map((char, index) => {
          if (isNaN(Number(char))) {
            return (
              <span key={index} className="w-2 text-center">
                {char}
              </span>
            );
          }
          const num = Number(char);
          return (
            <div key={index} className="relative w-3.5 h-7 overflow-hidden">
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: -num * 28 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute top-0 left-0 flex flex-col"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <span key={digit} className="h-7 flex items-center justify-center">
                    {digit}
                  </span>
                ))}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
