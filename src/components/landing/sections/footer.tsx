'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const Footer = () => {
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
            { title: "Methodology", links: [{label: "AI Tutoring", href: "#"}, {label: "Virtual Labs", href: "#"}, {label: "Hybrid Learning", href: "#"}, {label: "Assessment", href: "#"}] },
            { title: "Portals", links: [{label: "Students", href: "/login/student"}, {label: "Tutors", href: "/login/tutor"}, {label: "Parents", href: "/login/parent"}, {label: "Administrators", href: "/login/admin"}] },
            { title: "Resources", links: [{label: "Library", href: "#"}, {label: "Forums", href: "#"}, {label: "Live Archive", href: "#"}, {label: "Support", href: "#"}] },
            { title: "Institution", links: [{label: "About", href: "#"}, {label: "Faculty", href: "#"}, {label: "Contact", href: "#"}, {label: "Privacy", href: "#"}] }
          ].map((section, i) => (
            <div key={i}>
              <h4 className="font-bold mb-8 text-xs uppercase tracking-[0.2em] text-fin-lime">{section.title}</h4>
              <ul className="space-y-5 text-white/50 font-medium">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                  </li>
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
