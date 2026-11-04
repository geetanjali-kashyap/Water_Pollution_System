import React from "react";
import { motion } from "framer-motion";

// Import images
import pollutionImg from "../public/pollution.jpg";
import diseaseImg from "../public/diseases.jpg";
import predictionImg from "../public/prediction.jpg";

// -----------------------------------------
// Reusable InfoBox Component
// -----------------------------------------
const InfoBox: React.FC<{
  title: string;
  children: React.ReactNode;
  image: string;
  imagePosition: "left" | "right" | "top";
  style?: React.CSSProperties;
}> = ({ title, children, image, imagePosition, style }) => {   // <-- FIXED: style added!
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="shadow-lg rounded-2xl p-8 mb-14 flex flex-col gap-6"
      style={style}  // <-- COLOR APPLIED HERE
    >
      {/* Title */}
      <h2 className="text-3xl font-bold text-blue-700 mb-4">{title}</h2>

      <div
        className={`flex flex-col ${
          imagePosition !== "top"
            ? "md:flex-row items-center gap-8"
            : "md:flex-col"
        } ${imagePosition === "right" ? "md:flex-row-reverse" : ""}`}
      >
        {/* Image */}
        <motion.img
          src={image}
          alt={title}
          className="w-full md:w-1/2 h-64 object-cover rounded-xl shadow-md"
          initial={{
            opacity: 0,
            x:
              imagePosition === "right"
                ? 50
                : imagePosition === "left"
                ? -50
                : 0,
          }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        />

        {/* Text */}
        <motion.div
          className="text-slate-800 text-lg leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};

// -----------------------------------------
// Main Portfolio Page
// -----------------------------------------
const Portfolio: React.FC = () => {
  return (
    <div className="py-16 bg-gradient-to-b from-blue-50 via-white to-sky-50">
      <div className="container mx-auto px-6">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 mb-6">
            Water Quality Insights
          </h1>
          <p className="text-lg text-slate-700 mt-2">
            Understanding water pollution, related health issues, and how our AI system helps.
          </p>
        </motion.div>

        {/* Box 1 */}
        <InfoBox
          title="Rise in Water Pollution (Past Few Years)"
          image={pollutionImg}
          imagePosition="left"
          style={{ backgroundColor: "#E0F7FE" }} // light blue
        >
          Over the past decade, water pollution has increased at an alarming rate due to
          industrial discharge, untreated sewage, chemical fertilizers, and improper waste
          disposal. Rivers and groundwater sources now contain high levels of contaminants
          such as heavy metals, pesticides, microplastics, and harmful microorganisms.
          <br /><br />
          Climate change, urban expansion, and poor waste management have worsened the
          situation, affecting millions of people and ecosystems globally.
        </InfoBox>

        {/* Box 2 */}
        <InfoBox
          title="Diseases Caused by Contaminated Water"
          image={diseaseImg}
          imagePosition="right"
          style={{ backgroundColor: "#FFECEC" }} // light red
        >
          Polluted water contains bacteria, viruses, parasites, and toxic chemicals.
          Common diseases include cholera, typhoid, diarrhea, dysentery, hepatitis A,
          and giardiasis.
          <br /><br />
          Long-term consumption of contaminated water may lead to kidney failure,
          neurological disorders, skin problems, and increased cancer risk due to heavy
          metals such as arsenic and lead.
        </InfoBox>

        {/* Box 3 */}
        <InfoBox
          title="How Our Water Quality Prediction System Helps"
          image={predictionImg}
          imagePosition="left"
          style={{ backgroundColor: "#E7F5FF" }} // light cyan
        >
          Our AI-powered water quality prediction system analyzes key parameters such as
          turbidity, pH, dissolved oxygen, conductivity, and chemical contaminants.
          <br /><br />
          Separate models for *River Water* and *Tap Water* ensure more accurate and
          reliable predictions, helping communities detect unsafe water early and avoid
          serious health risks.
        </InfoBox>

      </div>
    </div>
  );
};

export default Portfolio;
