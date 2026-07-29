import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Cloud, Bug, Landmark, TrendingUp, MapPin, ArrowRight } from 'lucide-react';

const features = [
  { icon: Mic, title: 'Voice-First Translation', desc: 'Speak naturally in Hindi or Chhattisgarhi — get instant, accurate translation.' },
  { icon: Bug, title: 'Pest Identification', desc: 'Describe crop symptoms by voice and get pesticide recommendations.' },
  { icon: Cloud, title: 'Weather Advice', desc: 'Localized weather forecasts with farming advisories.' },
  { icon: Landmark, title: 'Government Schemes', desc: 'Discover PM-KISAN, PMFBY, KCC and more, explained simply.' },
  { icon: TrendingUp, title: 'Mandi Market Prices', desc: 'Live-style crop prices across nearby mandis.' },
  { icon: MapPin, title: 'Krishi Vigyan Kendras', desc: 'Find your nearest agricultural extension center.' },
];

export default function Landing() {
  return (
    <div className="space-y-20">
      <section className="text-center pt-10 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-vaani-primary/10 text-vaani-primary border border-vaani-primary/30 mb-6">
            Google Gemma Hackathon · Track 1 — Voice First Translation
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mx-auto">
            VAANI <span className="text-gradient">AI</span> — KrishiVoice
          </h1>
          <p className="mt-5 text-lg md:text-xl text-vaani-muted max-w-2xl mx-auto">
            Breaking language barriers between farmers and agricultural experts through voice AI.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/translator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-vaani-primary to-vaani-accent2 text-white font-semibold shadow-lg shadow-vaani-primary/20 hover:scale-105 transition-transform"
            >
              <Mic className="w-5 h-5" /> Start Speaking
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-card text-vaani-text font-medium hover:border-vaani-primary/50 transition-colors"
            >
              Learn more <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      <section>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="glass-card p-6 hover:border-vaani-primary/40 transition-colors animate-float"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              <div className="w-11 h-11 rounded-xl bg-vaani-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-vaani-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-vaani-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="glass-card p-8 md:p-12 text-center gradient-border">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Not a generic translator.</h2>
        <p className="text-vaani-muted max-w-2xl mx-auto">
          Every conversation is grounded in agricultural intent — pest control, crop planning,
          weather, schemes, mandi prices, and Krishi Vigyan Kendra lookup — so farmers get
          answers, not just translated words.
        </p>
      </section>
    </div>
  );
}
