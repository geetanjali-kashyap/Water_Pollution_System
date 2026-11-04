import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "../components/Card";

const Home: React.FC = () => {
  // (currently unused, remove if not needed)
  const [active, setActive] = React.useState("river");

  return (
    <div className="w-full flex flex-col text-white">
      {/* ---------- HERO SECTION ---------- */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-sky-900">
        {/* ---------- BACKGROUND ---------- */}
        <div className="absolute top-0 left-0 w-full h-full bg-sky-800 z-0">
          <div className="absolute bottom-0 left-0 w-full">
            <svg
              className="waves"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 24 150 28"
              preserveAspectRatio="none"
              shapeRendering="auto"
            >
              <defs>
                <path
                  id="gentle-wave"
                  d="M-160 44c30 0 58-18 88-18s58 18 88 18
                  58-18 88-18 58 18 88 18 v44h-352z"
                />
              </defs>
              <g className="parallax">
                <use
                  xlinkHref="#gentle-wave"
                  x="48"
                  y="0"
                  fill="rgba(255,255,255,0.7)"
                />
                <use
                  xlinkHref="#gentle-wave"
                  x="48"
                  y="3"
                  fill="rgba(255,255,255,0.5)"
                />
                <use
                  xlinkHref="#gentle-wave"
                  x="48"
                  y="5"
                  fill="rgba(255,255,255,0.3)"
                />
                <use
                  xlinkHref="#gentle-wave"
                  x="48"
                  y="7"
                  fill="rgba(255,255,255,1)"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* ---------- HERO CONTENT ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 px-4 sm:px-8"
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 text-cyan-300 drop-shadow-lg">
            Inspired by Nature, <br />
            Powered by Intelligence
          </h1>

          <p className="text-lg sm:text-xl text-sky-100 max-w-2xl mx-auto leading-relaxed mb-8">
            Ensuring Every Drop Counts. Our advanced AI analyzes water quality
            with unparalleled precision, safeguarding our most vital resource
            for a healthier planet.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <Link
              to="/prediction"
              className="inline-block bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-cyan-400/50 hover:scale-105 transition transform"
            >
              Start a Prediction
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ---------- FEATURES SECTION ---------- */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="py-16 px-6 bg-white text-center text-slate-900"
      >
        <h2 className="text-3xl font-bold mb-6">Why This?</h2>
        <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
          <Card
            title="Accurate Prediction"
            description="Our AI model provides high-accuracy predictions about water pollution levels."
            icon="💧"
            style={{ backgroundColor: "#E0F7FE" }}
          />
          <Card
            title="Fast Analysis"
            description="Get real-time results instantly with our efficient AI pipeline."
            icon="⚡"
            style={{ backgroundColor: "#FFECEC" }}
          />
          <Card
            title="User Friendly"
            description="Easy-to-use interface for researchers, students, and environmentalists."
            icon="🌍"
            style={{ backgroundColor: "#E7F5FF" }}
          />
        </div>
      </motion.section>

      {/* ---------- PARAMETERS SECTION ---------- */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        id="how-it-works"
        className="relative py-28 bg-gradient-to-b from-sky-100/40 to-white text-center text-slate-900"
      >
        {/* TOP WAVE */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
          <svg
            className="relative block w-full h-20"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path d="M0,64L1440,0L1440,160L0,160Z" fill="#e0f2ff" />
          </svg>
        </div>

        {/* Section Heading */}
        <h2 className="text-5xl font-extrabold mb-6 text-slate-800 tracking-wide drop-shadow-sm">
          Water Quality Evaluation
        </h2>

        <p className="text-slate-600 max-w-2xl mx-auto mb-20 text-lg">
          We predicts River and Tap water safety by analyzing scientific
          indicators with machine learning models. Experience a clean and modern
          interface below.
        </p>

        {/* ----------- RIVER WATER BOX ----------- */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto p-[2px] rounded-[30px] bg-gradient-to-r from-sky-300 via-blue-400 to-sky-300 shadow-2xl hover:shadow-sky-300/60 transition-all duration-500"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-10">
            <h3 className="text-3xl font-bold text-sky-700 mb-10">
              🌊 River Water Quality Prediction
            </h3>

            <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* Image */}
              <motion.img
                src="/river.jpg"   // <-- from public folder
                alt="River Water"
                initial={{ x: -90, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1, type: "spring" }}
                className="rounded-3xl shadow-xl ring-4 ring-sky-300/40 hover:scale-[1.03] transition-all duration-500"
              />

              {/* Glass Description Box */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-sky-50/80 backdrop-blur-xl p-7 rounded-2xl border border-sky-200 shadow-lg hover:shadow-sky-200/60 hover:scale-[1.01] transition-all duration-300"
              >
                <p className="text-slate-700 text-lg leading-relaxed mb-6">
                  River water quality prediction detects contamination levels,
                  evaluates ecosystem health, and identifies pollution sources
                  using advanced AI-based analysis.
                </p>

                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-center gap-3">
                    <span className="text-sky-700 text-xl">🌿</span> Monitors
                    river ecosystem health
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-sky-700 text-xl">🧪</span> Detects
                    chemical & industrial pollutants
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-sky-700 text-xl">🌧️</span> Analyses
                    seasonal water variation
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-sky-700 text-xl">🐟</span> Assesses
                    impact on aquatic life
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ----------- TAP WATER BOX ----------- */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto p-[2px] rounded-[30px] bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-300 shadow-2xl hover:shadow-emerald-300/60 transition-all duration-500 mt-24"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-10">
            <h3 className="text-3xl font-bold text-emerald-700 mb-10">
              🚰 Tap Water Quality Prediction
            </h3>

            <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* Glass Description Box */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-emerald-50/80 backdrop-blur-xl p-7 rounded-2xl border border-emerald-200 shadow-lg hover:shadow-emerald-200/60 hover:scale-[1.01] transition-all duration-300"
              >
                <p className="text-slate-700 text-lg leading-relaxed mb-6">
                  Tap water prediction analyzes drinkability standards, checks
                  for harmful chemicals, and ensures household water is safe for
                  daily usage.
                </p>

                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-700 text-xl">🧂</span> Detects
                    chemical impurities
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-700 text-xl">💧</span> Ensures
                    clarity & purity levels
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-700 text-xl">🧬</span> Checks
                    safe mineral content
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-700 text-xl">🛡️</span>{" "}
                    Verifies drinkable health standards
                  </li>
                </ul>
              </motion.div>

              {/* Image */}
              <motion.img
                src="/tap.jpg"   // <-- from public folder
                alt="Tap Water"
                initial={{ x: 90, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1, type: "spring" }}
                className="rounded-3xl shadow-xl ring-4 ring-emerald-300/40 hover:scale-[1.03] transition-all duration-500"
              />
            </div>
          </div>
        </motion.div>

        {/* BOTTOM WAVE */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg
            className="relative block w-full h-20"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path d="M0,64L1440,0L1440,160L0,160Z" fill="#e0ffe8" />
          </svg>
        </div>
      </motion.section>

      {/* ---------- CTA SECTION ---------- */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="py-16 bg-gradient-to-r from-sky-600 to-emerald-500 text-white text-center"
      >
        <motion.h2
          initial={{ y: 20 }}
          whileInView={{ y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold mb-4"
        >
          Ready to Predict Water Quality?
        </motion.h2>
        <motion.p
          initial={{ y: 20 }}
          whileInView={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 text-lg text-white/90"
        >
          Join us in protecting our most precious resource today.
        </motion.p>
        <Link
          to="/prediction"
          className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-full shadow hover:scale-105 transition"
        >
          Start Now
        </Link>
      </motion.section>
    </div>
  );
};

export default Home;
