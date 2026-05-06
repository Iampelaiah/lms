'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Check, 
  Plus, 
  Minus, 
  Menu, 
  X, 
  BarChart3, 
  BookOpen, 
  GraduationCap, 
  Zap, 
  Globe,
  Brain,
  Video,
  Library,
  Trophy,
  MessageCircle,
  MoreHorizontal
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

// --- Components ---

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

const Navbar = () => {
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(scrollY, [0, 100], ['rgba(0,0,0,0)', 'rgba(27, 43, 31, 0.8)']);
  const backdropBlur = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(12px)']);

  return (
    <motion.nav 
      style={{ backgroundColor, backdropFilter: backdropBlur }}
      className="fixed top-0 left-0 right-0 z-50 h-24 flex items-center px-6 md:px-12 transition-all"
    >
      {/* Left: Nav Links in Pill */}
      <div className="flex-1 hidden lg:flex items-center">
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-6 py-2.5 flex gap-8 text-[13px] font-semibold text-white/90">
            <a href="#methodology" className="hover:text-white transition-colors">Methodology</a>
            <a href="#curriculum" className="hover:text-white transition-colors">Curriculum</a>
            <a href="#resources" className="hover:text-white transition-colors">Resources</a>
        </div>
      </div>
      
      {/* Center: Logo */}
      <div className="flex flex-col items-center gap-0 absolute left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-fin-green" />
            </div>
            <span className="font-headline font-bold text-2xl text-white">Dr Max</span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/60 -mt-1 ml-10">Online School</span>
      </div>

      {/* Right: Auth & Menu */}
      <div className="flex-1 flex items-center justify-end gap-6">
        <Link href="/login" className="text-white text-sm font-bold hover:opacity-80 transition-opacity">Login</Link>
        <Button className="bg-white text-fin-green hover:bg-white/90 font-bold px-7 h-11 rounded-full text-sm" asChild>
            <Link href="/signup">Enroll now</Link>
        </Button>
        <Button variant="ghost" size="icon" className="text-white">
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
          data-ai-hint="student learning"
        />
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-fin-green via-fin-green/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-fin-green/40 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        {/* Left Side Content - Shifted to absolute bottom-left */}
        <div className="lg:col-span-8 mb-4">
          <motion.h1
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-[105px] font-headline font-bold text-white leading-[0.85] tracking-tight"
          >
            The future of <br /> learning together
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-8 text-lg md:text-xl text-white/80 max-w-xl leading-relaxed"
          >
            Empowering students with AI-driven paths, expert tutors, and a world-class curriculum designed for digital excellence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-10 flex items-center gap-4"
          >
            <Button size="lg" className="bg-fin-lime text-fin-green hover:bg-fin-lime/90 font-bold px-10 h-16 rounded-full text-lg group shadow-xl shadow-black/20" asChild>
              <Link href="/signup">
                Start learning <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 font-bold px-10 h-16 rounded-full text-lg shadow-xl shadow-black/20" asChild>
                <Link href="/login">Role Preview</Link>
            </Button>
          </motion.div>
        </div>

        {/* Right Side Floating Card - Resized and repositioned */}
        <div className="lg:col-span-4 flex justify-end">
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 0.6 }}
            transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            className="relative z-10 origin-bottom-right"
          >
            <div className="bg-white border border-white/20 rounded-[2.5rem] p-10 shadow-2xl shadow-black/40 min-w-[380px]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-fin-green font-headline font-bold text-3xl">Academic Growth</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-fin-lime" />
                    <p className="text-fin-green/40 text-xs font-bold uppercase tracking-widest">Average student mastery levels</p>
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
                    className={`flex-1 ${i === 3 ? 'bg-fin-green' : 'bg-fin-green/10'} rounded-2xl relative group overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-fin-lime translate-y-full group-hover:translate-y-0 transition-transform" />
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t border-fin-green/5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-fin-green/30 text-[10px] uppercase tracking-widest font-bold">Retention Rate</p>
                  <p className="text-2xl text-fin-green font-bold mt-1">98.4%</p>
                </div>
                <div>
                  <p className="text-fin-green/30 text-[10px] uppercase tracking-widest font-bold">Pass Velocity</p>
                  <p className="text-2xl text-fin-green font-bold mt-1">+24.5%</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 text-fin-green/40 text-[10px] font-bold italic">
                <Plus className="w-3 h-3" />
                <span>Updated every semester</span>
              </div>
            </div>
            {/* Added shadow for better separation */}
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
         <div className="inline-flex items-center gap-2 px-6 py-2 bg-fin-beige rounded-full border border-fin-green/5 text-[13px] font-semibold text-fin-green/60">
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

const Features = () => {
  return (
    <section id="methodology" className="py-24 px-6 md:px-12 bg-white relative">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
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

        {/* Right Column: Bento Feature Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            {/* Card 1: Control Spend Style */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-[#E4F0F2] rounded-[2.5rem] p-10 flex flex-col justify-between"
            >
                <div className="space-y-6">
                    <h3 className="text-3xl font-headline font-bold text-fin-green tracking-tight leading-tight">
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
                <Button variant="ghost" className="mt-10 w-fit bg-fin-green text-white hover:bg-fin-green/90 rounded-full px-6 h-12 font-bold flex gap-2">
                    Manage studies <ArrowRight className="w-4 h-4" />
                </Button>
            </motion.div>

            {/* Card 2: Tall Dark Card */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-fin-green rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden relative"
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

                {/* Abstract Palm Shadow Style Overlay */}
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

const StudySimulator = () => {
  const [hours, setHours] = useState(10);
  // Simple logic: Base 60% + 2% per hour, max 99%
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
          className="bg-fin-lime p-16 rounded-[4rem] text-fin-green shadow-2xl shadow-fin-lime/20"
        >
          <div className="space-y-16">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-sm uppercase tracking-widest">Weekly Study Hours</span>
                <span className="text-3xl font-bold font-headline">{hours} hrs</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="40" 
                step="1"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full h-2.5 bg-fin-green/10 rounded-full appearance-none cursor-pointer accent-fin-green"
              />
            </div>

            <div className="grid grid-cols-2 gap-10 border-t border-fin-green/10 pt-16">
              <div>
                <p className="text-fin-green/40 text-xs uppercase font-bold tracking-widest">Projected Grade</p>
                <div className="text-5xl font-headline font-bold mt-4 tracking-tighter">
                  <AnimatedNumber value={projectedGrade} suffix="%" />
                </div>
              </div>
              <div>
                <p className="text-fin-green/40 text-xs uppercase font-bold tracking-widest">Mastery Velocity</p>
                <div className="text-5xl font-headline font-bold mt-4 text-fin-green tracking-tighter">
                  <AnimatedNumber value={masteryBoost} suffix="x" />
                </div>
              </div>
            </div>

            <Button className="w-full bg-fin-green text-white hover:bg-fin-green/90 h-20 rounded-3xl font-bold text-xl transition-all active:scale-95" asChild>
              <Link href="/signup">Unlock Full Potential</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start start"]
  });

  const backgroundColor = useTransform(scrollYProgress, [0.5, 1], ["#F5F5F0", "#1B2B1F"]);
  const textColor = useTransform(scrollYProgress, [0.5, 1], ["#1B2B1F", "#FFFFFF"]);

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
                style={{ backgroundColor: i % 2 === 0 ? 'rgba(209, 243, 102, 0.05)' : 'transparent' }}
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

const ParallaxTestimonial = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -300]);

  return (
    <section ref={ref} className="relative h-[100vh] overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <Image 
          src="https://picsum.photos/seed/edu-parallax-exact/1600/900"
          alt="Student Success"
          fill
          className="object-cover brightness-50"
          data-ai-hint="graduated student"
        />
      </motion.div>
      
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-32 bg-gradient-to-t from-fin-green to-transparent">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-fin-lime p-16 rounded-[3.5rem] max-w-4xl shadow-2xl shadow-black/40"
        >
          <p className="text-4xl md:text-6xl font-headline font-bold text-fin-green leading-[0.9] tracking-tight">
            "Since joining Dr Max, my grade in Mathematics jumped from a C to an A+. The AI tutor changed how I study forever."
          </p>
          <div className="mt-12 flex items-center gap-6">
            <div className="w-16 h-16 bg-fin-green rounded-full flex items-center justify-center">
                <Trophy className="text-fin-lime w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-fin-green text-xl">Sarah Jenkins</p>
              <p className="text-fin-green/60 text-md font-bold uppercase tracking-widest">Grade 11 Student</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-fin-green text-white py-32 px-6 md:px-12 border-t border-white/5">
      <div className="container mx-auto">
        <div className="flex flex-col items-center text-center mb-32">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-6xl md:text-[140px] font-headline font-bold mb-16 leading-[0.8] tracking-tighter"
          >
            Start your digital <br /> learning journey
          </motion.h2>
          <Button size="lg" className="bg-fin-lime text-fin-green hover:bg-fin-lime/90 font-bold px-16 h-24 rounded-full text-3xl group transition-all duration-500 shadow-2xl shadow-fin-lime/20" asChild>
            <Link href="/signup">
                Enroll Today <ArrowRight className="ml-6 w-10 h-10 group-hover:translate-x-3 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-16 pt-32 border-t border-white/5">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-fin-lime rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-fin-green" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-headline font-bold text-3xl">Dr Max</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-fin-lime/80">Online School</span>
              </div>
            </div>
            <p className="text-white/30 max-w-xs text-lg leading-relaxed font-medium">
              Pioneering the future of digital education with AI-powered personalized learning systems.
            </p>
          </div>
          
          {[
            { title: "Methodology", links: ["AI Tutoring", "Virtual Labs", "Hybrid Learning", "Assessment"] },
            { title: "Portals", links: ["Students", "Tutors", "Parents", "Administrators"] },
            { title: "Resources", links: ["Library", "Forums", "Live Archive", "Support"] },
            { title: "Institution", links: ["About", "Faculty", "Contact", "Privacy"] }
          ].map((section, i) => (
            <div key={i}>
              <h4 className="font-bold mb-8 text-xs uppercase tracking-[0.2em] text-fin-lime">{section.title}</h4>
              <ul className="space-y-5 text-white/50 font-medium">
                {section.links.map((link, j) => (
                  <li key={j}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-32 pt-10 border-t border-white/5 flex flex-col md:row justify-between items-center gap-10 text-white/20 text-sm font-bold uppercase tracking-widest">
          <p>© 2024 Dr Max Online School. All rights reserved.</p>
          <div className="flex gap-12">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
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
