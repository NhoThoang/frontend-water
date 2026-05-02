'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Chọn một tùy chọn',
  label,
  className
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-1.5 ml-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border border-border bg-card/40 px-4 py-2.5 text-left text-sm transition-all duration-200 hover:bg-card/60 focus:outline-none focus:ring-2 focus:ring-primary/40",
          isOpen && "border-primary/50 ring-2 ring-primary/20 bg-card/80"
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOption?.icon && (
            <span className="text-primary shrink-0">{selectedOption.icon}</span>
          )}
          <span className={cn(
            "truncate",
            !selectedOption ? "text-muted-foreground" : "text-foreground font-medium"
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-300",
          isOpen && "rotate-180 text-primary"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute z-50 mt-1 w-full overflow-hidden rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/50 p-1.5"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-center text-sm text-muted-foreground italic">
                  Không có dữ liệu
                </div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-all duration-150",
                      value === option.value 
                        ? "bg-primary text-primary-foreground font-semibold" 
                        : "text-foreground/80 hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    {option.icon && (
                      <span className={cn(
                        "shrink-0",
                        value === option.value ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors"
                      )}>
                        {option.icon}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                    {value === option.value && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
