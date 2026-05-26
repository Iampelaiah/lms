'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Trophy } from 'lucide-react';
import Image from 'next/image';

export const ParallaxTestimonial = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -300]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      <motion.div style={{ y }} className="absolute -inset-y-40 inset-x-0">
        <Image
          src="https://picsum.photos/seed/edu-parallax-exact/1600/900"
          alt="Student Success"
          fill
          className="object-cover brightness-50"
          sizes="100vw"
          data-ai-hint="graduated student"
        />
      </motion.div>

      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-32 bg-gradient-to-t from-fin-green to-transparent">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-fin-lime p-10 rounded-[2.5rem] max-w-2xl shadow-2xl shadow-black/40"
        >
          <p className="text-2xl md:text-4xl font-headline font-bold text-fin-green leading-[1] tracking-tight">
            "Since joining Dr Max, my grade in Mathematics jumped from a C to an A+. The AI tutor changed how I study forever."
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-fin-green rounded-full flex items-center justify-center">
                <Trophy className="text-fin-lime w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-fin-green text-lg">Sarah Jenkins</p>
              <p className="text-fin-green/60 text-xs font-bold uppercase tracking-widest">Grade 11 Student</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
