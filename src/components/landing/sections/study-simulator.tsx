'use client';

import React, { useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const AnimatedNumber = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    return spring.onChange((latest) => {
      setDisplayValue(latest);
    });
  }, [spring]);

  return <span>{displayValue.toFixed(displayValue > 100 ? 0 : 1)}{suffix}</span>;
};

export const StudySimulator = () => {
  const [hours, setHours] = useState(10);
  // Base 60% + 2% per hour, max 99%
  const projectedGrade = Math.min(60 + (hours * 3), 99);
  const masteryBoost = hours * 1.5;

  return (
    <section className="py-32 px-6 md:px-12 bg-white">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-5xl md:text-7xl font-headline font-bold text-fin-green leading-[0.9] tracking-tight">Visualize your <br /> success.</h2>
          <p className="mt-8 text-2xl text-fin-green/60 max-w-md leading-relaxed">Our algorithm projects your performance based on commitment and resource engagement.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-fin-lime p-12 rounded-[3rem] text-fin-green shadow-2xl shadow-fin-lime/20"
        >
          <div className="space-y-12">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-sm uppercase tracking-widest">Weekly Study Hours</span>
                <span className="text-2xl font-bold font-headline">{hours} hrs</span>
              </div>
              {/* aria-label required: no visible <label> is associated with this input */}
              <input
                type="range"
                min="1"
                max="40"
                step="1"
                value={hours}
                aria-label="Select weekly study hours"
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full h-2.5 bg-fin-green/10 rounded-full appearance-none cursor-pointer accent-fin-green"
              />
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-fin-green/10 pt-12">
              <div>
                <p className="text-fin-green/40 text-xs uppercase font-bold tracking-widest">Projected Grade</p>
                <div className="text-4xl font-headline font-bold mt-4 tracking-tighter">
                  <AnimatedNumber value={projectedGrade} suffix="%" />
                </div>
              </div>
              <div>
                <p className="text-fin-green/40 text-xs uppercase font-bold tracking-widest">Mastery Velocity</p>
                <div className="text-4xl font-headline font-bold mt-4 text-fin-green tracking-tighter">
                  <AnimatedNumber value={masteryBoost} suffix="x" />
                </div>
              </div>
            </div>

            <Button className="w-full bg-fin-green text-white hover:bg-fin-green/90 h-[60px] rounded-2xl font-bold text-base transition-all active:scale-95" asChild>
              <Link href="/signup">Unlock Full Potential</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
