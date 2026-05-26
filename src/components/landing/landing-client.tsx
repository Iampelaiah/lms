'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  ArrowRight, 
  Plus, 
  Menu, 
  BarChart3, 
  GraduationCap, 
  Brain,
  Trophy
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import heavy sections
const Features = dynamic(() => import('./sections/features').then(mod => mod.Features), {
  loading: () => <div className="h-screen bg-white animate-pulse" />
});
const StudySimulator = dynamic(() => import('./sections/study-simulator').then(mod => mod.StudySimulator), {
  loading: () => <div className="h-[600px] bg-white animate-pulse" />
});
const FAQ = dynamic(() => import('./sections/faq').then(mod => mod.FAQ), {
  loading: () => <div className="h-[600px] bg-[#242424] animate-pulse" />
});
const ParallaxTestimonial = dynamic(() => import('./sections/parallax-testimonial').then(mod => mod.ParallaxTestimonial), {
  loading: () => <div className="h-screen bg-fin-green animate-pulse" />
});
const Footer = dynamic(() => import('./sections/footer').then(mod => mod.Footer), {
  loading: () => <div className="h-[400px] bg-fin-green animate-pulse" />
});

// --- Components ---

const Navbar = () => {
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(scrollY, [0, 100], ['rgba(0,0,0,0)', 'rgba(27, 43, 31, 0.8)']);
  const backdropBlur = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(12px)']);

  return (
    <motion.nav 
      style={{ backgroundColor, backdropFilter: backdropBlur }}
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 md:px-12 transition-all"
    >
      {/* Left: Nav Links in Pill */}
      <div className="flex-1 hidden lg:flex items-center">
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 flex gap-8 text-[10px] font-semibold text-white/90">
            <a href="#methodology" className="hover:text-white transition-colors">Methodology</a>
            <a href="#curriculum" className="hover:text-white transition-colors">Curriculum</a>
            <a href="#resources" className="hover:text-white transition-colors">Resources</a>
        </div>
      </div>
      
      {/* Center: Logo */}
      <div className="flex flex-col items-center gap-0 absolute left-1/2 -translate-x-1/2 pointer-events-none">
        <Image 
          src="/logo.png" 
          alt="Dr Max Online School Logo" 
          width={64} 
          height={24} 
          className="object-contain" 
          priority
        />
      </div>

      {/* Right: Auth & Menu */}
      <div className="flex-1 flex items-center justify-end gap-6">
        <Link href="/login" className="text-white text-xs font-bold hover:opacity-80 transition-opacity">Login</Link>
        <Button className="bg-white text-fin-green hover:bg-white/90 font-bold px-5 h-8 rounded-full text-xs" asChild>
            <Link href="/signup">Enroll now</Link>
        </Button>
        {/* aria-label required: icon-only button must have an accessible name */}
        <Button variant="ghost" size="icon" className="text-white" aria-label="Toggle navigation menu">
            <Menu className="w-6 h-6" />
        </Button>
      </div>
    </motion.nav>
  );
};

const Hero = () => {
  return (
    <section className="relative h-screen flex items-end overflow-hidden bg-fin-green">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://picsum.photos/seed/edu-hero-precise/1920/1080"
          alt="Student learning"
          fill
          className="object-cover brightness-90"
          priority
          sizes="100vw"
          data-ai-hint="student learning"
        />
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-fin-green via-fin-green/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-fin-green/40 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        {/* Left Side Content - Bottom-aligned */}
        <div className="lg:col-span-8 mb-4">
          <motion.h1
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-[74px] font-headline font-bold text-white leading-[0.85] tracking-tight"
          >
            The future of <br /> learning together
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-8 text-base md:text-lg text-white/80 max-w-xl leading-relaxed"
          >
            Empowering students with AI-driven paths, expert tutors, and a world-class curriculum designed for digital excellence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-10 flex items-center gap-4"
          >
            <Button size="lg" className="bg-fin-lime text-fin-green hover:bg-fin-lime/90 font-bold px-7 h-11 rounded-full text-base group shadow-xl shadow-black/20" asChild>
              <Link href="/signup">
                Start learning <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 font-bold px-7 h-11 rounded-full text-base shadow-xl shadow-black/20" asChild>
                <Link href="/login">Role Preview</Link>
            </Button>
          </motion.div>
        </div>

        {/* Right Side Floating Card - Resized smaller */}
        <div className="lg:col-span-4 flex justify-end">
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 0.6 }}
            transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            className="relative z-10 origin-bottom-right"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/20 min-w-[380px]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-white font-headline font-bold text-3xl">Academic Growth</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-fin-lime" />
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Average student mastery levels</p>
                  </div>
                </div>
                <div className="w-14 h-14 bg-fin-lime rounded-2xl flex items-center justify-center">
                  <BarChart3 className="text-fin-green w-8 h-8" />
                </div>
              </div>
              
              <div className="flex items-end gap-4 h-40">
                {[40, 65, 35, 95, 55, 80, 75].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 1.2 + i * 0.1, duration: 0.8 }}
                    className={`flex-1 ${i === 3 ? 'bg-white' : 'bg-white/10'} rounded-2xl relative group overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-fin-lime translate-y-full group-hover:translate-y-0 transition-transform" />
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Retention Rate</p>
                  <p className="text-2xl text-white font-bold mt-1">98.4%</p>
                </div>
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Pass Velocity</p>
                  <p className="text-2xl text-white font-bold mt-1">+24.5%</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 text-white/40 text-[10px] font-bold italic">
                <Plus className="w-3 h-3" />
                <span>Updated every semester</span>
              </div>
            </div>
            {/* Shadow for separation */}
            <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-black/40 blur-[120px] rounded-full -z-10 pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Marquee = () => {
  const brands = ["EduCore", "ThinkLab", "LearnGrid", "SkillPath", "StudyFlow", "EduNova", "Academiq"];
  
  return (
    <div className="bg-white pt-24 pb-12 overflow-hidden">
      <div className="container mx-auto px-6 mb-16 flex flex-col items-center">
         {/* Contrast bumped from /30 to /70 to meet WCAG AA minimum contrast ratio */}
         <div className="inline-flex items-center gap-2 px-6 py-2 bg-fin-beige rounded-full border border-fin-green/10 text-[13px] font-semibold text-fin-green/70">
            <span>Join over 10,000 students already learning with Dr Max.</span>
         </div>
      </div>

      <div className="flex whitespace-nowrap">
        <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="flex gap-20 items-center px-10"
        >
            {[...brands, ...brands].map((item, i) => (
            <span key={i} className="text-2xl font-headline font-bold text-fin-green/30 uppercase tracking-tighter italic">
                {item}
            </span>
            ))}
        </motion.div>
      </div>
    </div>
  );
};

export const LandingClient = () => {
  return (
    <div className="min-h-screen bg-fin-beige selection:bg-fin-lime selection:text-fin-green">
      <Navbar />
      <Hero />
      <Marquee />
      <Features />
      <StudySimulator />
      <FAQ />
      <ParallaxTestimonial />
      <Footer />
    </div>
  );
};
