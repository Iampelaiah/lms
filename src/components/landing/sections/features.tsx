'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export const Features = () => {
  return (
    <section id="methodology" className="py-24 px-6 md:px-12 bg-white relative">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-stretch">
        {/* Left Column: Massive Headline & Text */}
        <div className="lg:col-span-5 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-7xl font-headline font-bold text-fin-green leading-[1] tracking-tight">
              Build for your <br /> next gen of <br /> learning
            </h2>
            <div className="mt-10 flex flex-wrap gap-4">
               <Button size="lg" className="bg-fin-green text-white hover:bg-fin-green/90 font-bold px-8 h-14 rounded-full text-md group">
                  Start learning <ArrowRight className="ml-2 w-4 h-4" />
               </Button>
               <Button size="lg" variant="outline" className="border-fin-green/10 text-fin-green hover:bg-fin-beige font-bold px-8 h-14 rounded-full text-md">
                  Learn more
               </Button>
            </div>

            <div className="mt-16 space-y-6 max-w-md">
              <p className="text-fin-green/60 text-lg leading-relaxed">
                Experience seamless integration of technology and education, built for your success and convenience.
              </p>
              <p className="text-fin-green/60 text-lg leading-relaxed font-bold">
                The power of an AI-driven school, with none of the legacy baggage. Dr Max gives modern learners and tutors an intuitive platform for exam-readiness and mastery.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Bento Feature Cards - Exact Stagger and Scale */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative h-full">
            {/* Card 1: Landscape (Wide/Short) - Light Background */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.93 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0 }}
                className="bg-[#E4F0F2] rounded-[2.5rem] p-7 flex flex-col justify-between md:col-span-3 lg:col-span-2 min-h-[224px] absolute bottom-[10px] left-0 w-[57%]"
            >
                <div className="space-y-6">
                    <h3 className="text-2xl font-headline font-bold text-fin-green tracking-tight leading-tight">
                        Control study <br /> effortlessly at any pace
                    </h3>
                    <ul className="space-y-4 text-fin-green/60 font-medium">
                        <li className="flex items-center gap-3">
                            <ArrowRight className="w-4 h-4" />
                            <span>Adaptive learning paths</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <ArrowRight className="w-4 h-4" />
                            <span>24/7 AI tutor support</span>
                        </li>
                    </ul>
                </div>
                <Button variant="ghost" className="mt-7 w-fit bg-fin-green text-white hover:bg-fin-green/90 rounded-full px-5 h-9 font-bold flex gap-2 text-sm">
                    Manage studies <ArrowRight className="w-4 h-4" />
                </Button>
            </motion.div>

            {/* Card 2: Portrait (Narrow/Tall) - Dark Background */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.93 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className="bg-fin-green rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden absolute bottom-[10px] right-0 w-[40%] min-h-[380px]"
            >
                <div className="space-y-8 relative z-10">
                    {/* UI Mockup Snippets */}
                    <div className="space-y-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 w-full flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-fin-lime/20 flex items-center justify-center">
                                    <Brain className="w-6 h-6 text-fin-lime" />
                                </div>
                                <span className="text-white text-sm font-bold">Ask AI Buddy</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <Plus className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 w-fit ml-auto flex items-center gap-4">
                             <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Ongoing session</span>
                             <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full border-2 border-fin-green bg-blue-500 overflow-hidden">
                                    <Image src="https://picsum.photos/seed/face1/40/40" alt="user" width={40} height={40} />
                                </div>
                                <div className="w-6 h-6 rounded-full border-2 border-fin-green bg-green-500 overflow-hidden">
                                    <Image src="https://picsum.photos/seed/face2/40/40" alt="user" width={40} height={40} />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 relative z-10">
                    <h3 className="text-3xl font-headline font-bold text-fin-lime tracking-tight leading-tight">
                        Fuel your future with <br /> world-class certified <br /> expert tutors
                    </h3>
                </div>

                {/* Abstract Shadow Style Overlay */}
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-150">
                        <path fill="#D1F366" d="M44.7,-76.4C58.1,-69.2,70.1,-58.5,77.4,-45.3C84.7,-32.1,87.3,-16,85.1,-0.6C82.9,14.8,75.9,29.5,67,42.5C58.1,55.5,47.3,66.8,34.4,73.5C21.5,80.2,6.5,82.3,-8.4,79.5C-23.3,76.7,-38.1,69,-50.2,58.4C-62.3,47.8,-71.7,34.3,-76.5,19.3C-81.3,4.3,-81.5,-12.3,-75.7,-26.8C-69.9,-41.3,-58.1,-53.7,-44.6,-61C-31.1,-68.3,-15.5,-70.5,-0.1,-70.3C15.3,-70.1,31.2,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
                    </svg>
                </div>
            </motion.div>
        </div>
      </div>
    </section>
  );
};
