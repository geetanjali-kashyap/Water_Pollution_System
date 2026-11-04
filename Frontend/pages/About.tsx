import React from "react";
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";

type Factor = {
  title: string;
  short: string;
  impact: string;
  color: string;
  icon: string;
};

const FactorCard: React.FC<{ f: Factor }> = ({ f }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
    className={`p-5 rounded-2xl shadow-lg border ${f.color} transition duration-200 hover:shadow-xl`}
  >
    <div className="flex items-center gap-4 mb-3">
      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/70 text-2xl shadow">
        {f.icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
    </div>
    <p className="text-sm text-slate-700 mb-3">{f.short}</p>
    <div className="text-sm">
      <strong className="text-slate-800">Impact:</strong>
      <p className="text-slate-600 mt-1">{f.impact}</p>
    </div>
  </motion.div>
);

const About: React.FC = () => {
  const factors: Factor[] = [
    { title: "Temperature (°C)", short: "Water warmth that affects chemistry & biology.", impact: "Higher temperatures reduce dissolved oxygen and speed up microbial activity — can stress fish and accelerate pollutant breakdown.", color: "bg-amber-50", icon: "🌡️" },
    { title: "Dissolved Oxygen (mg/L)", short: "Oxygen available for aquatic life.", impact: "Low DO is a strong sign of organic pollution and can cause fish kills. Healthy ecosystems need adequate DO levels.", color: "bg-cyan-50", icon: "💧" },
    { title: "pH", short: "Acidity/alkalinity scale (0–14).", impact: "pH outside safe range (6.5–8.5) harms aquatic life and increases metal solubility (toxicity).", color: "bg-violet-50", icon: "⚗️" },
    { title: "Conductivity (µmho/cm)", short: "Amount of dissolved salts/ions.", impact: "High conductivity suggests industrial discharge — affects taste, corrosion, and plant growth.", color: "bg-lime-50", icon: "🧪" },
    { title: "BOD (mg/L)", short: "Biochemical Oxygen Demand — organic load indicator.", impact: "High BOD = lots of organic matter; microbes deplete oxygen to decompose it, harming aquatic life.", color: "bg-red-50", icon: "⚠️" },
    { title: "Nitrate N (mg/L)", short: "Nutrients from fertilizers & sewage.", impact: "High nitrates cause eutrophication (algae blooms) and can harm infants (blue baby syndrome).", color: "bg-rose-50", icon: "🌾" },
    { title: "Fecal Coliform (MPN/100ml)", short: "Indicator of fecal contamination.", impact: "Signals sewage or animal waste — high pathogen risk; unsafe for drinking without treatment.", color: "bg-sky-50", icon: "🦠" },
    { title: "Total Coliform (MPN/100ml)", short: "General bacterial indicator group.", impact: "Elevated counts suggest contamination; requires treatment & investigation of pollution sources.", color: "bg-green-50", icon: "🔬" },
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-sky-50 py-16 overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* 🌊 HERO SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative text-center mb-20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 via-cyan-100/20 to-teal-200/20 blur-3xl rounded-full" />
          <h1 className="relative text-5xl sm:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 mb-6">
            Clean Water, Smart Decisions 💧
          </h1>
          <p className="relative text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed">
            Our intelligent water quality prediction system helps you understand, monitor, and take timely action to keep water safe and sustainable for all.
          </p>

         
        </motion.section>

        {/* ⚙️ STATISTICS */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16"
        >
          {[
            { label: "Model Trained On", value: "~10k+ Samples", desc: "Diverse real-world water data" },
            { label: "Average Prediction Time", value: "0.5s", desc: "Fast, efficient inference" },
            { label: "Accuracy", value: "85%", desc: "Validated with domain experts" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md border p-6 text-center hover:shadow-lg transition">
              <div className="text-sm text-slate-500">{stat.label}</div>
              <div className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</div>
              <p className="text-sm text-slate-600 mt-2">{stat.desc}</p>
            </div>
          ))}
        </motion.section>

        {/* 🌍 VISION & IMPACT */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl shadow-md border">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h2>
            <p className="text-slate-700 leading-relaxed">
              To empower every individual and organization to measure, predict, and protect water quality — one drop at a time.
            </p>
            <ul className="mt-4 text-slate-700 space-y-2">
              <li>✔ Democratize environmental monitoring</li>
              <li>✔ Promote data-driven sustainability</li>
              <li>✔ Support smart water management</li>
            </ul>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-8 rounded-2xl shadow-md border">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Why It Matters</h2>
            <p className="text-slate-700 mb-3">
              Every year, millions suffer due to unsafe water. Monitoring water quality proactively can save lives, protect biodiversity, and ensure clean resources for future generations.
            </p>
            <div className="grid gap-3 text-slate-700">
              <div>💧 <strong>Public Health:</strong> Detect contamination early.</div>
              <div>🌿 <strong>Environment:</strong> Protect ecosystems and rivers.</div>
              <div>📊 <strong>Governance:</strong> Enable data-driven policy and awareness.</div>
            </div>
          </motion.div>
        </section>

        {/* 🔬 FACTORS */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-8 text-slate-900">
            Key Water Quality Factors
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {factors.map((f) => (
              <FactorCard key={f.title} f={f} />
            ))}
          </div>
        </section>

        {/* 📘 CTA */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            Ready to check your water quality?
          </h3>
          <p className="text-slate-600 mb-4">
            Get instant predictions and recommendations for safer, cleaner water.
          </p>
          <Link
            to="/prediction"
            className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-full shadow hover:scale-105 transition"
          >
            Go to Predictor →
          </Link>
        </motion.section>

        {/* FOOTER */}
        <footer className="text-center text-sm text-slate-500 mt-16">
          © {new Date().getFullYear()} Water Quality Predictor — Built for Science, Community & Sustainability 🌎
        </footer>
      </div>
    </div>
  );
};

export default About;
