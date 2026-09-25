'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const RollingNumberTicker: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}> = ({ value, prefix = 'Rp', suffix = '', className = '' }) => {
  const formatted = value.toLocaleString('id-ID');

  return (
    <div className={`inline-flex items-center text-xl font-bold font-mono tracking-tight text-text-primary overflow-hidden h-7 select-none ${className}`}>
      {prefix && <span className="mr-1">{prefix}</span>}
      <div className="flex items-center overflow-hidden">
        {formatted.split('').map((char, index) => {
          if (isNaN(Number(char))) {
            return (
              <span key={index} className="px-[1px] font-bold text-center leading-none">
                {char}
              </span>
            );
          }
          const num = Number(char);
          return (
            <div key={index} className="relative w-[13px] h-7 overflow-hidden">
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: -num * 28 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                className="absolute top-0 left-0 flex flex-col items-center w-full"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <span key={digit} className="h-7 flex items-center justify-center text-center leading-none">
                    {digit}
                  </span>
                ))}
              </motion.div>
            </div>
          );
        })}
      </div>
      {suffix && <span className="ml-1 text-xs font-normal text-text-muted">{suffix}</span>}
    </div>
  );
};
