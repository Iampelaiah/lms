import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, BookOpenText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Loader2 } from 'lucide-react';

interface GradingHeaderProps {
  studentName?: string;
  submissionTitle?: string;
  onClose: () => void;
  onSubmit: (e: any) => void;
  isLoading: boolean;
}

export default function GradingHeader({ studentName, submissionTitle, onClose, onSubmit, isLoading }: GradingHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-obsidian">
      {/* Brand & Context */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-royal/10 text-royal">
          <BookOpenText className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-white leading-tight">Cambridge Tutor Editor</h1>
          <span className="text-xs text-white/60 font-medium">IGCSE English – Paper 2</span>
        </div>
      </div>

      {/* Selectors */}
      <div className="flex items-center gap-6 hidden md:flex">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/60">Student:</span>
          <Select defaultValue="aisha">
            <SelectTrigger className="w-[160px] h-8 text-sm font-semibold border-none shadow-none focus:ring-0 px-0 text-white">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent className="bg-obsidian border-white/10 text-white">
              <SelectItem value="aisha">{studentName || "Aisha Khan"}</SelectItem>
              <SelectItem value="pelaiah">Pelaiah Tapera</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-px h-6 bg-white/10" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/60">Submission:</span>
          <Select defaultValue="essay1">
            <SelectTrigger className="w-[200px] h-8 text-sm font-semibold border-none shadow-none focus:ring-0 px-0 text-white">
              <SelectValue placeholder="Select submission" />
            </SelectTrigger>
            <SelectContent className="bg-obsidian border-white/10 text-white">
              <SelectItem value="essay1">{submissionTitle || "Essay – 21 May 2024"}</SelectItem>
              <SelectItem value="essay2">Essay – 14 May 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" className="h-9 px-4 text-sm font-semibold text-white bg-white/5 hover:bg-white/10 border-white/10" onClick={onClose}>
          Cancel
        </Button>
        <Button className="h-9 px-5 text-sm font-bold bg-royal hover:bg-royal/90 text-obsidian" onClick={onSubmit} disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-obsidian" />}
          Publish Marks
        </Button>
      </div>
    </header>
  );
}


