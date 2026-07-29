import React from 'react';
import { Sprout, Mic, Cpu, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-vaani-primary to-vaani-accent2 flex items-center justify-center mb-4">
          <Sprout className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold">About VAANI AI</h1>
        <p className="text-vaani-muted mt-2">Breaking Language Barriers Between Farmers and Agricultural Experts Through Voice AI</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-semibold text-lg">The Problem</h2>
        <p className="text-sm text-vaani-muted leading-relaxed">
          Indian farmers often speak Hindi or regional dialects like Chhattisgarhi, while
          agricultural officers, experts, and digital services commonly operate in Hindi or
          English. This communication gap leads to misunderstandings, delayed advice, and
          limited access to government schemes and market information.
        </p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-semibold text-lg">The Solution</h2>
        <p className="text-sm text-vaani-muted leading-relaxed">
          VAANI AI is a voice-first multilingual agricultural assistant. A farmer speaks
          naturally in their own language, an AI model understands the agricultural context,
          translates it, and calls the right function when structured data is needed —
          weather, mandi prices, government schemes, pest advice, or nearest Krishi Vigyan
          Kendra — replying back by voice in the farmer's language.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Mic, label: 'Voice-first, not text-first' },
          { icon: Cpu, label: 'Agriculture-grounded reasoning' },
          { icon: ShieldCheck, label: 'Rate-limited, validated, secure API' },
        ].map((item) => (
          <div key={item.label} className="glass-card p-5 text-center">
            <item.icon className="w-6 h-6 text-vaani-primary mx-auto mb-2" />
            <p className="text-sm text-vaani-muted">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
