'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const FAQ = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start start"]
  });

  const backgroundColor = useTransform(scrollYProgress, [0.5, 1], ["#242424", "#1A1A1A"]);
  const textColor = useTransform(scrollYProgress, [0.5, 1], ["#FFFFFF", "#FFFFFF"]);

  return (
    <motion.section
      ref={containerRef}
      style={{ backgroundColor }}
      className="py-32 px-6 md:px-12 transition-colors duration-500"
    >
      <div className="container mx-auto max-w-4xl">
        <motion.h2
          style={{ color: textColor }}
          className="text-5xl md:text-8xl font-headline font-bold mb-20 text-center leading-[0.85] tracking-tight"
        >
          Frequently Asked <br /> Questions
        </motion.h2>

        <Accordion type="single" collapsible className="space-y-6">
          {[
            { q: "Is Dr Max Online School accredited?", a: "Yes, our curriculum is fully aligned with national standards and our certificates are recognized globally for further education." },
            { q: "How do the AI tutors work?", a: "Our AI Study Buddy uses advanced Gemini LLMs to analyze your specific learning gaps and generate personalized summaries, quizzes, and study paths." },
            { q: "Can I switch between subjects?", a: "Absolutely. Our platform is designed for flexible learning. You can enroll in multiple courses and manage them all from a single dashboard." },
            { q: "What role do parents play?", a: "Parents have a dedicated portal to monitor attendance, real-time progress, and academic milestones, ensuring a collaborative approach to education." }
          ].map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b-0">
              <motion.div
                style={{ backgroundColor: i % 2 === 0 ? 'rgba(128, 0, 0, 0.15)' : 'transparent' }}
                className="rounded-3xl border border-white/10 overflow-hidden"
              >
                <AccordionTrigger className="px-10 py-8 text-white hover:no-underline group">
                  <span className="text-left font-headline font-bold text-2xl tracking-tight">{item.q}</span>
                </AccordionTrigger>
                <AccordionContent className="px-10 pb-10 text-white/60 text-xl leading-relaxed">
                  {item.a}
                </AccordionContent>
              </motion.div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </motion.section>
  );
};
