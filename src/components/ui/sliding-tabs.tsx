'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHapticFeedback } from '@/lib/haptic';

export interface TabItem {
  id: string;
  label: string;
  badgeCount?: number | string;
  badgeColor?: string;
}

export interface StandardSlidingTabsProps {
  tabs: TabItem[];
  activeTab?: number;
  defaultTab?: number;
  onChange?: (index: number) => void;
  children: (activeIndex: number) => React.ReactNode;
}

export const StandardSlidingTabs: React.FC<StandardSlidingTabsProps> = ({
  tabs,
  activeTab: controlledActiveTab,
  defaultTab = 0,
  onChange,
  children,
}) => {
  const [internalTab, setInternalTab] = useState(defaultTab);
  const [direction, setDirection] = useState(0);

  const currentTab = controlledActiveTab !== undefined ? controlledActiveTab : internalTab;

  useEffect(() => {
    if (controlledActiveTab !== undefined && controlledActiveTab !== internalTab) {
      setDirection(controlledActiveTab > internalTab ? 1 : -1);
      setInternalTab(controlledActiveTab);
    }
  }, [controlledActiveTab, internalTab]);

  const handleSelect = (idx: number) => {
    if (idx === currentTab) return;
    setDirection(idx > currentTab ? 1 : -1);
    setInternalTab(idx);
    onChange?.(idx);
    triggerHapticFeedback('selection');
  };

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Magnetic Sliding Pill Tab Bar */}
      <div className="flex items-center p-1.5 bg-surface-subtle border border-border-subtle rounded-2xl w-fit max-w-full overflow-x-auto shadow-2xs select-none">
        {tabs.map((tab, idx) => {
          const isActive = currentTab === idx;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelect(idx)}
              className={`relative px-4 py-2 text-xs font-bold tracking-tight transition-colors z-10 flex items-center gap-2 whitespace-nowrap cursor-pointer rounded-xl ${
                isActive
                  ? 'text-brand-primary dark:text-teal-300'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badgeCount !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-mono font-black rounded-full leading-none ${
                    tab.badgeColor || (isActive ? 'bg-teal-500/15 text-brand-primary' : 'bg-surface-card text-text-muted')
                  }`}
                >
                  {tab.badgeCount}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-surface-card rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-border-subtle/90 z-[-1]"
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 30,
                    mass: 0.8,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Realistic Direction-Aware Sliding Body */}
      <div className="relative overflow-hidden w-full min-h-[400px]">
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={currentTab}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: dir > 0 ? 36 : -36,
                opacity: 0,
                scale: 0.99,
              }),
              center: {
                x: 0,
                opacity: 1,
                scale: 1,
              },
              exit: (dir: number) => ({
                x: dir > 0 ? -36 : 36,
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
            {children(currentTab)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
