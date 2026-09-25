'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/lib/haptic';

export interface TabItem {
  id: string;
  label: string;
  badgeCount?: number;
}

export interface StandardSlidingTabsProps {
  tabs: TabItem[];
  defaultTab?: number;
  onChange?: (index: number) => void;
  children: (activeIndex: number) => React.ReactNode;
}

export const StandardSlidingTabs: React.FC<StandardSlidingTabsProps> = ({
  tabs,
  defaultTab = 0,
  onChange,
  children,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [direction, setDirection] = useState(0);

  const handleSelect = (idx: number) => {
    if (idx === activeTab) return;
    setDirection(idx > activeTab ? 1 : -1);
    setActiveTab(idx);
    onChange?.(idx);
    haptic.selection();
  };

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Magnetic Sliding Pill Tab Bar */}
      <div className="flex p-1 bg-surface-subtle border border-border-subtle rounded-2xl w-fit">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === idx;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(idx)}
              className={`relative px-4 py-2 text-xs font-semibold tracking-wide transition-colors z-10 flex items-center gap-1.5 ${
                isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-brand-subtle text-brand-primary font-bold">
                  {tab.badgeCount}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-surface-card rounded-xl shadow-subtle border border-border-subtle/80 z-[-1]"
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Realistic Direction-Aware Sliding Body */}
      <div className="relative overflow-hidden w-full min-h-[360px]">
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={activeTab}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: dir > 0 ? 32 : -32,
                opacity: 0,
                scale: 0.99,
              }),
              center: {
                x: 0,
                opacity: 1,
                scale: 1,
              },
              exit: (dir: number) => ({
                x: dir > 0 ? -32 : 32,
                opacity: 0,
                scale: 0.99,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 32,
              mass: 0.8,
            }}
            className="w-full h-full"
          >
            {children(activeTab)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
