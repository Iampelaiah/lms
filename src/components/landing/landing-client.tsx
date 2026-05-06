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
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Globe 
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// --- Components ---

const AnimatedNumber = ({ value }: { value: number }) => {
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

  return <span>${displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
};

const Navbar = () => {
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(scrollY, [0, 100], ['rgba(245, 245, 240, 0)', 'rgba(245, 245, 240, 0.7)']);
  const backdropBlur = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(10px)']);
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 0.1]);

  return (
    <motion.nav 
      style={{ backgroundColor, backdropFilter: backdropBlur }}
      className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-6 md:px-12 border-b border-fin-green/10"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-fin-lime rounded-full" />
        <span className="font-headline font-bold text-xl text-fin-green">Dr Max</span>
      </div>
      
      <div className="hidden md:flex flex-1 justify-center gap-8 text-sm font-medium text-fin-green/70">
        <a href="#" className="hover:text-fin-green transition-colors">Features</a>
        <a href="#" className="hover:text-fin-green transition-colors">Solutions</a>
        <a href="#" className="hover:text-fin-green transition-colors">Company</a>
        <a href="#" className="hover:text-fin-green transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" className="text-fin-green font-semibold">Login</Button>
        <Button className="bg-white text-fin-green hover:bg-white/90 font-bold px-6 border border-fin-green/10">Sign up</Button>
      </div>
    </motion.nav>
  );
};

const Hero = () => {
  const words = "Built for fast moving business".split(" ");
  
  return (
    <section className="relative min-h-screen flex items-center pt-20 px-6 md:px-12 overflow-hidden bg-fin-beige">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="z-10 max-w-2xl">
          <div className="overflow-hidden flex flex-wrap gap-x-4">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-7xl font-headline font-bold text-fin-green block"
              >
                {word}
              </motion.span>
            ))}
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-8 text-lg text-fin-green/60 max-w-md leading-relaxed"
          >
            Scale your infrastructure effortlessly with a platform designed for the speed of modern commerce. 
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-10"
          >
            <Button size="lg" className="bg-fin-lime text-fin-green hover:bg-fin-lime/90 font-bold px-8 h-14 rounded-full text-lg group">
              Get started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
            className="relative z-10"
          >
            <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl shadow-fin-green/5">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-fin-green font-headline font-bold text-2xl">Cashflow</h3>
                  <p className="text-fin-green/40 text-sm">Last 30 days performance</p>
                </div>
                <div className="w-12 h-12 bg-fin-lime rounded-2xl flex items-center justify-center">
                  <BarChart3 className="text-fin-green" />
                </div>
              </div>
              
              <div className="flex items-end gap-3 h-48">
                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 1.5 + i * 0.1, duration: 0.8 }}
                    className="flex-1 bg-fin-green/10 rounded-t-lg relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-fin-lime translate-y-full group-hover:translate-y-0 transition-transform" />
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t border-fin-green/5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-fin-green/40 text-xs uppercase tracking-widest font-bold">Total revenue</p>
                  <p className="text-2xl text-fin-green font-bold mt-1">$45,231.89</p>
                </div>
                <div>
                  <p className="text-fin-green/40 text-xs uppercase tracking-widest font-bold">Growth</p>
                  <p className="text-2xl text-fin-lime font-bold mt-1">+12.5%</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="absolute -top-20 -right-20 w-80 h-80 bg-fin-lime/20 rounded-full blur-3xl" />
        </div>
      </div>

      <div className="absolute top-0 right-0 w-1/2 h-full -z-0 opacity-20 lg:opacity-100">
        <Image 
          src="https://picsum.photos/seed/fin-hero/800/1200"
          alt="Business"
          fill
          className="object-cover grayscale mix-blend-multiply"
          priority
        />
      </div>
    </section>
  );
};

const Marquee = () => {
  const logos = ["Vercel", "Stripe", "Airbnb", "Nike", "Amazon", "Shopify", "Slack"];
  
  return (
    <div className="py-12 bg-white border-y border-fin-green/5 overflow-hidden flex whitespace-nowrap">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="flex gap-20 items-center px-10"
      >
        {[...logos, ...logos].map((logo, i) => (
          <span key={i} className="text-3xl font-headline font-bold text-fin-green/20 uppercase tracking-tighter italic">
            {logo}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const Features = () => {
  return (
    <section className="py-24 px-6 md:px-12 bg-fin-beige relative">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="lg:sticky lg:top-40 h-fit">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-headline font-bold text-fin-green leading-tight"
          >
            Next gen of <br /> payment solutions
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-fin-green/60 max-w-sm"
          >
            Everything you need to accept payments and manage your business globally.
          </motion.p>
          <Button variant="outline" className="mt-8 border-fin-green text-fin-green hover:bg-fin-green hover:text-white rounded-full px-8">
            Learn more
          </Button>
        </div>

        <div className="space-y-12">
          {[
            { 
              title: "Global Transfers", 
              desc: "Move money across 180+ countries instantly with zero hidden fees.",
              icon: Globe,
              bg: "bg-fin-lime"
            },
            { 
              title: "High-level Security", 
              desc: "AES-256 encryption and biometric authentication for every transaction.",
              icon: ShieldCheck,
              bg: "bg-white"
            },
            { 
              title: "Smart Automations", 
              desc: "Set up triggers for recurring payments and automatic reconciliation.",
              icon: Zap,
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

const Calculator = () => {
  const [revenue, setRevenue] = useState(50000);
  const fee = revenue * 0.024;
  const net = revenue - fee;

  return (
    <section className="py-24 px-6 md:px-12 bg-white">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-4xl md:text-6xl font-headline font-bold text-fin-green">One transparent fee.</h2>
          <p className="mt-6 text-xl text-fin-green/60 max-w-md">No monthly minimums, no surprises. Just straightforward pricing for your growth capital.</p>
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
                <span className="font-bold text-sm uppercase tracking-widest">Monthly Revenue</span>
                <span className="text-2xl font-bold font-headline">${revenue.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="10000" 
                max="500000" 
                step="5000"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="w-full h-2 bg-fin-green/10 rounded-full appearance-none cursor-pointer accent-fin-green"
              />
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-fin-green/10 pt-12">
              <div>
                <p className="text-fin-green/40 text-xs uppercase font-bold tracking-widest">Service Fee (2.4%)</p>
                <div className="text-3xl font-headline font-bold mt-2">
                  <AnimatedNumber value={fee} />
                </div>
              </div>
              <div>
                <p className="text-fin-green/40 text-xs uppercase font-bold tracking-widest">Net Capital</p>
                <div className="text-3xl font-headline font-bold mt-2">
                  <AnimatedNumber value={net} />
                </div>
              </div>
            </div>

            <Button className="w-full bg-fin-green text-white hover:bg-fin-green/90 h-16 rounded-2xl font-bold text-lg">
              Apply for capital
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
            { q: "How fast can I get funding?", a: "Most applications are approved within 24 hours, and funds are disbursed to your linked account instantly after approval." },
            { q: "What are the eligibility requirements?", a: "We look for businesses with at least 6 months of operating history and consistent monthly revenue of $10k+." },
            { q: "Are there any hidden charges?", a: "Absolutely not. We pride ourselves on transparent, flat-fee pricing that you agree to upfront." },
            { q: "Is my data secure?", a: "We use bank-grade AES-256 encryption and are fully compliant with SOC2 and PCI-DSS standards." }
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
          src="https://picsum.photos/seed/testimonial-parallax/1600/900"
          alt="Success Story"
          fill
          className="object-cover brightness-50"
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
            "Since switching to Dr Max, our revenue cycle improved by 40%. It's the partner we were looking for."
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-fin-green rounded-full" />
            <div>
              <p className="font-bold text-fin-green">Sarah Jenkins</p>
              <p className="text-fin-green/60 text-sm">CEO at TechFlow</p>
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
            Speak to our <br /> financing experts
          </motion.h2>
          <Button size="lg" className="bg-fin-lime text-fin-green hover:bg-fin-lime/90 font-bold px-12 h-20 rounded-full text-2xl group transition-all duration-500">
            Book a call <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 pt-24 border-t border-white/5">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-fin-lime rounded-full" />
              <span className="font-headline font-bold text-2xl">Dr Max</span>
            </div>
            <p className="text-white/40 max-w-xs leading-relaxed">
              Leading the way in modern business financing and payment infrastructure.
            </p>
          </div>
          
          {[
            { title: "Product", links: ["Features", "Security", "Pricing", "Integrations"] },
            { title: "Solutions", links: ["Startups", "Enterprise", "Ecommerce", "Global"] },
            { title: "Resources", links: ["Blog", "Guides", "API Docs", "Community"] },
            { title: "Company", links: ["About", "Careers", "Legal", "Contact"] }
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
      <Calculator />
      <FAQ />
      <ParallaxTestimonial />
      <Footer />
    </div>
  );
};