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
  Trophy
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
  const backgroundColor = useTransform(scrollY, [0, 100], ['rgba(245, 245, 240, 0)', 'rgba(245, 245, 240, 0.7)']);
  const backdropBlur = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(10px)']);

  return (
    <motion.nav 
      style={{ backgroundColor, backdropFilter: backdropBlur }}
      className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-6 md:px-12 border-b border-fin-green/10"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-fin-lime rounded-full flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-fin-green" />
        </div>
        <div className="flex flex-col leading-none">
            <span className="font-headline font-bold text-xl text-fin-green">Dr Max</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-fin-green/60">Online School</span>
        </div>
      </div>
      
      <div className="hidden md:flex flex-1 justify-center gap-8 text-sm font-medium text-fin-green/70">
        <a href="#methodology" className="hover:text-fin-green transition-colors">Methodology</a>
        <a href="#curriculum" className="hover:text-fin-green transition-colors">Curriculum</a>
        <a href="#ai-tools" className="hover:text-fin-green transition-colors">AI Tools</a>
        <a href="#pricing" className="hover:text-fin-green transition-colors">Tuition</a>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" className="text-fin-green font-semibold" asChild>
            <Link href="/login">Login</Link>
        </Button>
        <Button className="bg-white text-fin-green hover:bg-white/90 font-bold px-6 border border-fin-green/10" asChild>
            <Link href="/signup">Enroll Now</Link>
        </Button>
      </div>
    </motion.nav>
  );
};

const Hero = () => {
  const words = "The future of personalized learning".split(" ");
  
  return (
    <section className="relative min-h-screen flex items-center pt-20 px-6 md:px-12 overflow-hidden bg-fin-green">
      {/* Background Image Container - Fullscreen */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://picsum.photos/seed/edu-hero-fs/1920/1080"
          alt="Student learning"
          fill
          className="object-cover brightness-[0.4] grayscale-[0.2]"
          priority
          data-ai-hint="student learning"
        />
        {/* Gradient Overlay for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-fin-green via-fin-green/60 to-transparent" />
      </div>

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="max-w-2xl">
          <div className="overflow-hidden flex flex-wrap gap-x-4">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-7xl font-headline font-bold text-white block"
              >
                {word}
              </motion.span>
            ))}
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-8 text-lg text-white/70 max-w-md leading-relaxed"
          >
            Empowering students with AI-driven paths, expert tutors, and a world-class curriculum designed for digital excellence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-10 flex gap-4"
          >
            <Button size="lg" className="bg-fin-lime text-fin-green hover:bg-fin-lime/90 font-bold px-8 h-14 rounded-full text-lg group" asChild>
              <Link href="/signup">
                Start Learning <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-fin-green font-bold px-8 h-14 rounded-full text-lg" asChild>
              <Link href="/login">Role Preview</Link>
            </Button>
          </motion.div>
        </div>

        <div className="relative hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
            className="relative z-10"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/20">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-white font-headline font-bold text-2xl">Academic Growth</h3>
                  <p className="text-white/60 text-sm">Average student mastery levels</p>
                </div>
                <div className="w-12 h-12 bg-fin-lime rounded-2xl flex items-center justify-center">
                  <Brain className="text-fin-green" />
                </div>
              </div>
              
              <div className="flex items-end gap-3 h-48">
                {[60, 85, 55, 95, 75, 90, 88].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 1.5 + i * 0.1, duration: 0.8 }}
                    className="flex-1 bg-white/10 rounded-t-lg relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-fin-lime translate-y-full group-hover:translate-y-0 transition-transform" />
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Retention Rate</p>
                  <p className="text-2xl text-white font-bold mt-1">98.4%</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Pass Velocity</p>
                  <p className="text-2xl text-fin-lime font-bold mt-1">+24.5%</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="absolute -top-20 -right-20 w-80 h-80 bg-fin-lime/20 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  );
};

const Marquee = () => {
  const partners = ["Accredited", "AI-Powered", "Global Reach", "24/7 Access", "Expert Tutors", "Virtual Labs", "Personalized"];
  
  return (
    <div className="py-12 bg-white border-y border-fin-green/5 overflow-hidden flex whitespace-nowrap">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        className="flex gap-20 items-center px-10"
      >
        {[...partners, ...partners].map((item, i) => (
          <span key={i} className="text-3xl font-headline font-bold text-fin-green/20 uppercase tracking-tighter italic">
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const Features = () => {
  return (
    <section id="methodology" className="py-24 px-6 md:px-12 bg-fin-beige relative">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="lg:sticky lg:top-40 h-fit">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-headline font-bold text-fin-green leading-tight"
          >
            Next gen of <br /> digital education
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-fin-green/60 max-w-sm"
          >
            Everything you need to master any subject and prepare for your future.
          </motion.p>
          <Button variant="outline" className="mt-8 border-fin-green text-fin-green hover:bg-fin-green hover:text-white rounded-full px-8" asChild>
            <Link href="/signup">View Methodology</Link>
          </Button>
        </div>

        <div className="space-y-12">
          {[
            { 
              title: "Live Virtual Classes", 
              desc: "Connect with world-class educators in real-time with peer-to-peer video classrooms.",
              icon: Video,
              bg: "bg-fin-lime"
            },
            { 
              title: "AI Study Buddy", 
              desc: "Get 24/7 personalized tutoring powered by Gemini AI, tailored to your learning pace.",
              icon: Brain,
              bg: "bg-white"
            },
            { 
              title: "Global Resource Library", 
              desc: "Access thousands of curated worksheets, video lectures, and e-books instantly.",
              icon: Library,
              bg: "bg-fin-green",
              dark: true
            }
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`p-10 rounded-[2.5rem] shadow-xl shadow-fin-green/5 ${card.bg} ${card.dark ? 'text-white' : 'text-fin-green'}`}
            >
              <card.icon className="w-12 h-12 mb-6" />
              <h3 className="text-3xl font-headline font-bold">{card.title}</h3>
              <p className={`mt-4 ${card.dark ? 'text-white/60' : 'text-fin-green/60'} leading-relaxed`}>
                {card.desc}
              </p>
              <div className="mt-8 flex justify-end">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${card.dark ? 'border-white/20' : 'border-fin-green/20'}`}>
                  <ArrowRight />
                </div>
              </div>
            </motion.div>
          ))}
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
    <section className="py-24 px-6 md:px-12 bg-white">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-4xl md:text-6xl font-headline font-bold text-fin-green">Visualize your success.</h2>
          <p className="mt-6 text-xl text-fin-green/60 max-w-md">Our algorithm projects your performance based on commitment and resource engagement.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-fin-lime p-12 rounded-[3rem] text-fin-green"
        >
          <div className="space-y-12">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-sm uppercase tracking-widest">Weekly Study Hours</span>
                <span className="text-2xl font-bold font-headline">{hours} hrs</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="40" 
                step="1"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full h-2 bg-fin-green/10 rounded-full appearance-none cursor-pointer accent-fin-green"
              />
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-fin-green/10 pt-12">
              <div>
                <p className="text-fin-green/40 text-xs uppercase font-bold tracking-widest">Projected Grade</p>
                <div className="text-3xl font-headline font-bold mt-2">
                  <AnimatedNumber value={projectedGrade} suffix="%" />
                </div>
              </div>
              <div>
                <p className="text-fin-green/40 text-xs uppercase font-bold tracking-widest">Mastery Velocity</p>
                <div className="text-3xl font-headline font-bold mt-2 text-fin-green">
                  <AnimatedNumber value={masteryBoost} suffix="x" />
                </div>
              </div>
            </div>

            <Button className="w-full bg-fin-green text-white hover:bg-fin-green/90 h-16 rounded-2xl font-bold text-lg" asChild>
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
      className="py-24 px-6 md:px-12 transition-colors duration-500"
    >
      <div className="container mx-auto max-w-4xl">
        <motion.h2 
          style={{ color: textColor }}
          className="text-4xl md:text-6xl font-headline font-bold mb-16 text-center"
        >
          Frequently Asked <br /> Questions
        </motion.h2>

        <Accordion type="single" collapsible className="space-y-4">
          {[
            { q: "Is Dr Max Online School accredited?", a: "Yes, our curriculum is fully aligned with national standards and our certificates are recognized globally for further education." },
            { q: "How do the AI tutors work?", a: "Our AI Study Buddy uses advanced Gemini LLMs to analyze your specific learning gaps and generate personalized summaries, quizzes, and study paths." },
            { q: "Can I switch between subjects?", a: "Absolutely. Our platform is designed for flexible learning. You can enroll in multiple courses and manage them all from a single dashboard." },
            { q: "What role do parents play?", a: "Parents have a dedicated portal to monitor attendance, real-time progress, and academic milestones, ensuring a collaborative approach to education." }
          ].map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b-0">
              <motion.div 
                style={{ backgroundColor: i % 2 === 0 ? 'rgba(209, 243, 102, 0.05)' : 'transparent' }}
                className="rounded-2xl border border-white/10"
              >
                <AccordionTrigger className="px-8 py-6 text-white hover:no-underline group">
                  <span className="text-left font-headline font-bold text-xl">{item.q}</span>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-8 text-white/60 text-lg leading-relaxed">
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
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <section ref={ref} className="relative h-[80vh] overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <Image 
          src="https://picsum.photos/seed/edu-parallax/1600/900"
          alt="Student Success"
          fill
          className="object-cover brightness-50"
          data-ai-hint="graduated student"
        />
      </motion.div>
      
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-24 bg-gradient-to-t from-fin-green to-transparent">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-fin-lime p-12 rounded-[2.5rem] max-w-3xl"
        >
          <p className="text-3xl md:text-5xl font-headline font-bold text-fin-green leading-tight">
            "Since joining Dr Max, my grade in Mathematics jumped from a C to an A+. The AI tutor changed how I study forever."
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-fin-green rounded-full flex items-center justify-center">
                <Trophy className="text-fin-lime w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-fin-green">Sarah Jenkins</p>
              <p className="text-fin-green/60 text-sm">Grade 11 Student</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-fin-green text-white py-24 px-6 md:px-12 border-t border-white/5">
      <div className="container mx-auto">
        <div className="flex flex-col items-center text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-8xl font-headline font-bold mb-12"
          >
            Start your digital <br /> learning journey
          </motion.h2>
          <Button size="lg" className="bg-fin-lime text-fin-green hover:bg-fin-lime/90 font-bold px-12 h-20 rounded-full text-2xl group transition-all duration-500" asChild>
            <Link href="/signup">
                Enroll Today <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 pt-24 border-t border-white/5">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-fin-lime rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-fin-green" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-headline font-bold text-2xl">Dr Max</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-fin-lime/80">Online School</span>
              </div>
            </div>
            <p className="text-white/40 max-w-xs leading-relaxed">
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
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-fin-lime">{section.title}</h4>
              <ul className="space-y-4 text-white/60">
                {section.links.map((link, j) => (
                  <li key={j}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-white/40 text-sm">
          <p>© 2024 Dr Max Online School. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Settings</a>
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
