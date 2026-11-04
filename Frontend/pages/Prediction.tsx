import React, { useState } from "react";
import { useAuth } from "../App";
import API_BASE_URL from "../utils/api";

type FormState = {
  temperature: string;
  dissolvedOxygen: string;
  ph: string;
  conductivity: string;
  bod: string;
  nitrate: string;
  fecalColiform: string;
  totalColiform: string;
};

const initialState: FormState = {
  temperature: "",
  dissolvedOxygen: "",
  ph: "",
  conductivity: "",
  bod: "",
  nitrate: "",
  fecalColiform: "",
  totalColiform: "",
};

type RiverFieldConfig = {
  name: keyof FormState;
  label: string;
  placeholder: string;
  hint: string;
  unit?: string;
  min: number;
  max: number;
};

const RIVER_FIELDS: RiverFieldConfig[] = [
  {
    name: "temperature",
    label: "Temperature (°C)",
    placeholder: "Temperature (°C)",
    hint: "Valid range: 0 – 45 °C",
    unit: "°C",
    min: 0,
    max: 45,
  },
  {
    name: "dissolvedOxygen",
    label: "Dissolved Oxygen (mg/L)",
    placeholder: "Dissolved Oxygen (mg/L)",
    hint: "Valid range: 0 – 15 mg/L (above 6 = good)",
    unit: "mg/L",
    min: 0,
    max: 15,
  },
  {
    name: "ph",
    label: "pH (0 – 14)",
    placeholder: "pH (0 – 14)",
    hint: "Valid range: 0 – 14 (safe surface water)",
    unit: "",
    min: 0,
    max: 14,
  },
  {
    name: "conductivity",
    label: "Conductivity (µmho/cm)",
    placeholder: "Conductivity (µmho/cm)",
    hint: "Valid range: 0 – 3000 µmho/cm",
    unit: "µmho/cm",
    min: 0,
    max: 3000,
  },
  {
    name: "bod",
    label: "BOD (mg/L)",
    placeholder: "BOD (mg/L)",
    hint: "Valid range: 0 – 30 mg/L ( >5 = polluted )",
    unit: "mg/L",
    min: 0,
    max: 30,
  },
  {
    name: "nitrate",
    label: "Nitrate N (mg/L)",
    placeholder: "Nitrate N (mg/L)",
    hint: "Valid range: 0 – 50 mg/L",
    unit: "mg/L",
    min: 0,
    max: 50,
  },
  {
    name: "fecalColiform",
    label: "Fecal Coliform (MPN/100ml)",
    placeholder: "Fecal Coliform (MPN/100ml)",
    hint: "Valid range: 0 – 100000 MPN/100ml",
    unit: "MPN/100ml",
    min: 0,
    max: 100000,
  },
  {
    name: "totalColiform",
    label: "Total Coliform (MPN/100ml)",
    placeholder: "Total Coliform (MPN/100ml)",
    hint: "Valid range: 0 – 250000 MPN/100ml",
    unit: "MPN/100ml",
    min: 0,
    max: 250000,
  },
];

type ErrorState = Partial<Record<keyof FormState, string>>;

// Tap parameters: Low/Average/High selections
type TapParam = {
  name: string;
  value: "Low" | "Average" | "High";
  description?: string;
};
type TapPayload = {
  ph: number;
  Hardness: number;
  Chloramines: number;
  Sulfate: number;
  Turbidity: number;
};

const TAP_PARAM_META: Record<
  string,
  {
    icon: string;
    subtitle: string;
    lowDesc: string;
    avgDesc: string;
    highDesc: string;
  }
> = {
  "PH Level": {
    icon: "🧪",
    subtitle: "Taste, color & pipe condition.",
    lowDesc: "Tastes sour or causes blue/green stains/corrosion on pipes.",
    avgDesc: "Tastes neutral, no abnormal pipe issues.",
    highDesc: "Feels soapy or causes scaling / white crusty deposits.",
  },
  Hardness: {
    icon: "💎",
    subtitle: "Soap lather & white spots.",
    lowDesc: "Soap lathers very easily, no spots on dishes.",
    avgDesc: "Soap lathers well, minimal spotting / scale buildup.",
    highDesc: "Soap won’t lather easily, heavy residue/scale on fixtures.",
  },
  Chloramines: {
    icon: "🧴",
    subtitle: "Chemical smell / taste.",
    lowDesc: "No noticeable chemical taste or smell.",
    avgDesc: "Faint, common chlorine smell / taste.",
    highDesc: "Strong bleach-like smell or chemical taste.",
  },
  Sulfate: {
    icon: "🌫️",
    subtitle: "Possible salty/bitter taste.",
    lowDesc: "No unusual salty or bitter taste.",
    avgDesc: "Occasional mild salty/bitter after-taste.",
    highDesc: "Frequent salty/bitter taste that is hard to ignore.",
  },
  Turbidity: {
    icon: "🌊",
    subtitle: "Cloudiness & visible particles.",
    lowDesc: "Looks clear, no visible particles.",
    avgDesc: "Slight haze or occasional tiny particles.",
    highDesc: "Noticeable cloudiness, visible suspended particles.",
  },
};

const Prediction: React.FC = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<ErrorState>({});
  const [waterType, setWaterType] = useState<"river" | "tap">("river");
  const [showForm, setShowForm] = useState(false);

  const [tapParams, setTapParams] = useState<TapParam[]>([
    { name: "PH Level", value: "Average", description: "PH of tap water" },
    { name: "Hardness", value: "Average", description: "Hardness (scale)" },
    { name: "Chloramines", value: "Average", description: "Chloramine level" },
    { name: "Sulfate", value: "Average", description: "Sulfate level" },
    { name: "Turbidity", value: "Average", description: "Cloudiness (NTU)" },
  ]);

  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------- Utility & Validation ----------------

  const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const validateField = (
    name: keyof FormState,
    value: string
  ): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Required field";
    }

    const num = Number(trimmed);
    if (Number.isNaN(num)) {
      return "Please enter a valid number";
    }

    const config = RIVER_FIELDS.find((f) => f.name === name);
    if (!config) return null;

    if (num < config.min || num > config.max) {
      return `Valid range: ${config.min} – ${config.max} ${
        config.unit ?? ""
      }`.trim();
    }

    return null;
  };

  const isRiverFormValid = () => {
    const newErrors: ErrorState = {};
    RIVER_FIELDS.forEach((field) => {
      const msg = validateField(field.name, formData[field.name]);
      if (msg) {
        newErrors[field.name] = msg;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof FormState;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (waterType === "river") {
      const msg = validateField(key, value);
      setErrors((prev) => ({
        ...prev,
        [key]: msg || "",
      }));
    }
  };

  const handleTapParamChange = (
    name: string,
    value: "Low" | "Average" | "High"
  ) => {
    setTapParams((prev) =>
      prev.map((p) => (p.name === name ? { ...p, value } : p))
    );
  };

  // Tap L/A/H → numeric ranges
  const convertTapToNumeric = (params: TapParam[]): TapPayload => {
    const numeric: TapPayload = {
      ph: 7,
      Hardness: 200,
      Chloramines: 7,
      Sulfate: 320,
      Turbidity: 4,
    };

    params.forEach((p) => {
      const key = p.name.toLowerCase();
      const v = p.value;

      if (key.includes("ph")) {
        if (v === "Low") numeric.ph = randomInt(1, 5);
        else if (v === "Average") numeric.ph = randomInt(6, 9);
        else numeric.ph = randomInt(10, 14);
      }

      if (key.includes("hard")) {
        if (v === "Low") numeric.Hardness = randomInt(50, 150);
        else if (v === "Average") numeric.Hardness = randomInt(155, 236);
        else numeric.Hardness = randomInt(237, 400);
      }

      if (key.includes("chlor")) {
        if (v === "Low") numeric.Chloramines = randomInt(1, 5);
        else if (v === "Average") numeric.Chloramines = randomInt(6, 9);
        else numeric.Chloramines = randomInt(10, 15);
      }

      if (key.includes("sulfate")) {
        if (v === "Low") numeric.Sulfate = randomInt(50, 280);
        else if (v === "Average") numeric.Sulfate = randomInt(284, 385);
        else numeric.Sulfate = randomInt(386, 600);
      }

      if (key.includes("turb")) {
        if (v === "Low") numeric.Turbidity = randomInt(0, 2);
        else if (v === "Average") numeric.Turbidity = randomInt(3, 5);
        else numeric.Turbidity = randomInt(6, 10);
      }
    });

    return numeric;
  };

  const resetAll = () => {
    setFormData(initialState);
    setPrediction(null);
    setError(null);
    setIsLoading(false);
    setErrors({});
    setTapParams([
      { name: "PH Level", value: "Average", description: "pH of tap water" },
      { name: "Hardness", value: "Average", description: "Hardness (scale)" },
      {
        name: "Chloramines",
        value: "Average",
        description: "Chloramine level",
      },
      { name: "Sulfate", value: "Average", description: "Sulfate level" },
      { name: "Turbidity", value: "Average", description: "Cloudiness (NTU)" },
    ]);
  };

  // ---------------- API Submit ----------------

  const submitPrediction = async (
    payload: unknown,
    endpoint: string = `${API_BASE_URL}/api/prediction/predict`
  ) => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Prediction request failed");
      }

      const raw = String(result.prediction || "").trim();
      const normalized = raw.toLowerCase();

      if (
        normalized.includes("pollut") ||
        normalized.includes("not pot") ||
        normalized.includes("unsafe")
      ) {
        setPrediction("Polluted");
      } else if (
        normalized.includes("moderate") ||
        normalized.includes("potable") ||
        normalized.includes("safe")
      ) {
        setPrediction("Moderate");
      } else {
        setPrediction(raw);
      }
    } catch (err) {
      console.error(err);
      setError(
        "An error occurred while fetching the prediction. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRiverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRiverFormValid()) return;
    await submitPrediction(formData, `${API_BASE_URL}/api/prediction/river`);
  };

  const handleTapSubmit = async () => {
    const numericPayload = convertTapToNumeric(tapParams);
    await submitPrediction(
      numericPayload,
      `${API_BASE_URL}/api/prediction/tap-status`
    );
  };

  // ---------------- Explanation block ----------------

  const renderExplanation = (pred: string) => {
    const normalized = pred.toLowerCase();

    if (pred === "Polluted") {
      return (
        <div className="my-6 text-left">
          <h3 className="text-xl font-semibold mb-2">
            What does "Polluted" mean?
          </h3>
          <p className="text-gray-700 mb-4">
            Polluted water is unsafe for drinking or food preparation. It may
            contain high levels of harmful chemicals, biological contaminants
            (bacteria, viruses), or toxic substances which can cause immediate
            illness or long-term health problems.
          </p>
          <h3 className="text-xl font-semibold mb-2">Health Risks</h3>
          <ul className="list-inside list-disc text-gray-700 mb-4">
            <li>Gastrointestinal infections (diarrhea, vomiting).</li>
            <li>Skin and eye infections on contact.</li>
            <li>Long-term exposure can affect organs and development.</li>
          </ul>
          <h3 className="text-xl font-semibold mb-2">Recommendations</h3>
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <ul className="list-inside list-disc text-gray-700">
              <li>
                Do not drink this water without strong treatment (RO + UV /
                boiling + filtering).
              </li>
              <li>Avoid using this water for cooking or feeding infants.</li>
              <li>
                Report serious contamination to local authorities if this is a
                public source.
              </li>
            </ul>
          </div>
        </div>
      );
    }

    if (pred === "Moderate") {
      return (
        <div className="my-6 text-left">
          <h3 className="text-xl font-semibold mb-2">
            What does "Moderate" mean?
          </h3>
          <p className="text-gray-700 mb-4">
            Moderate water quality means the water is not extremely polluted but
            may not meet ideal drinking standards, especially for sensitive
            people (kids, elderly, pregnant women).
          </p>
          <h3 className="text-xl font-semibold mb-2">Health Notes</h3>
          <ul className="list-inside list-disc text-gray-700 mb-4">
            <li>May be usable for washing and cleaning.</li>
            <li>
              For drinking, basic treatment (filtration + boiling) is
              recommended.
            </li>
          </ul>
          <h3 className="text-xl font-semibold mb-2">Recommendations</h3>
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <ul className="list-inside list-disc text-gray-700">
              <li>Use household filters or boil water before drinking.</li>
              <li>
                Monitor taste/smell and avoid if something feels off.
              </li>
            </ul>
          </div>
        </div>
      );
    }

    if (normalized === "low") {
      return (
        <div className="my-6 text-left">
          <h3 className="text-xl font-semibold mb-2">Tap Quality: Low Risk</h3>
          <p className="text-gray-700 mb-4">
            Your tap water is in the <strong>Low</strong> risk zone based on pH,
            Hardness, Chloramines, Sulfate, and Turbidity. Overall, parameters
            look within safer ranges.
          </p>
          <h3 className="text-xl font-semibold mb-2">What this means</h3>
          <ul className="list-inside list-disc text-gray-700 mb-4">
            <li>
              Suitable for regular household use and drinking (with normal
              filtration).
            </li>
            <li>
              Less chances of irritation, strange taste, or visible impurities.
            </li>
          </ul>
          <h3 className="text-xl font-semibold mb-2">Tips</h3>
          <div className="bg-emerald-50 p-4 rounded-md border border-emerald-200">
            <ul className="list-inside list-disc text-gray-700">
              <li>Use a basic filter for better taste and extra safety.</li>
              <li>Clean your filter regularly to maintain good quality.</li>
            </ul>
          </div>
        </div>
      );
    }

    if (normalized === "average") {
      return (
        <div className="my-6 text-left">
          <h3 className="text-xl font-semibold mb-2">
            Tap Quality: Average
          </h3>
          <p className="text-gray-700 mb-4">
            Your tap water is in the <strong>Average</strong> zone. Most
            parameters are around the typical range, but some might be slightly
            higher or lower than ideal.
          </p>
          <h3 className="text-xl font-semibold mb-2">What this means</h3>
          <ul className="list-inside list-disc text-gray-700 mb-4">
            <li>Generally usable for bathing, cleaning and sometimes drinking.</li>
            <li>
              For long-term daily drinking, a good quality filter/RO is
              recommended.
            </li>
          </ul>
          <h3 className="text-xl font-semibold mb-2">Tips</h3>
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <ul className="list-inside list-disc text-gray-700">
              <li>
                Use RO/UV filter if possible, especially for children and
                elderly.
              </li>
              <li>
                Check for unusual smell, color, or taste time to time.
              </li>
            </ul>
          </div>
        </div>
      );
    }

    if (normalized === "high") {
      return (
        <div className="my-6 text-left">
          <h3 className="text-xl font-semibold mb-2">
            Tap Quality: High Risk
          </h3>
          <p className="text-gray-700 mb-4">
            One or more tap water parameters are in the <strong>High</strong>{" "}
            zone (for example excessive hardness, turbidity, or chemicals). This
            can affect taste, pipes, and long-term health.
          </p>
          <h3 className="text-xl font-semibold mb-2">Possible Issues</h3>
          <ul className="list-inside list-disc text-gray-700 mb-4">
            <li>Scaling in utensils, geysers and pipes due to high hardness.</li>
            <li>
              Cloudy/colored water due to higher turbidity or contaminants.
            </li>
            <li>
              Long-term excess chemicals may stress kidneys or cause other
              health issues.
            </li>
          </ul>
          <h3 className="text-xl font-semibold mb-2">Recommendations</h3>
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <ul className="list-inside list-disc text-gray-700">
              <li>Use advanced treatment (RO + UV) for drinking.</li>
              <li>
                Avoid giving this water directly to infants or people with
                kidney issues.
              </li>
              <li>
                Consider periodic lab testing if you suspect serious
                contamination.
              </li>
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="my-6 text-left">
        <h3 className="text-xl font-semibold mb-2">Prediction result</h3>
        <p className="text-gray-700">
          Model returned: <strong>{pred}</strong>
        </p>
      </div>
    );
  };

  // ---------------- Result Screen ----------------

  if (prediction) {
    const normalized = prediction.toLowerCase();

    let title = prediction;
    let headerBg = "bg-gray-100";
    let badgeBg = "bg-gray-900";
    const badgeText = "text-white";

    if (prediction === "Polluted") {
      title = "Polluted River Water";
      headerBg = "bg-red-50";
      badgeBg = "bg-red-600";
    } else if (prediction === "Moderate") {
      title = "Moderate River Water";
      headerBg = "bg-amber-50";
      badgeBg = "bg-amber-600";
    } else if (normalized === "low") {
      title = "Tap Water – Low Risk";
      headerBg = "bg-emerald-50";
      badgeBg = "bg-emerald-600";
    } else if (normalized === "average") {
      title = "Tap Water – Average Quality";
      headerBg = "bg-amber-50";
      badgeBg = "bg-amber-600";
    } else if (normalized === "high") {
      title = "Tap Water – High Risk";
      headerBg = "bg-red-50";
      badgeBg = "bg-red-600";
    }

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h1 className="text-center text-3xl font-extrabold mb-6 text-gray-900">
            {title}
          </h1>

          <div className={`${headerBg} rounded-2xl p-5 text-center mb-4`}>
            <span
              className={`inline-flex px-5 py-2 font-semibold rounded-full shadow-sm ${badgeBg} ${badgeText}`}
            >
              {prediction}
            </span>
            <p className="mt-3 text-sm text-gray-600">
              This result is generated using your selected parameters and our
              trained water quality model.
            </p>
          </div>

          {renderExplanation(prediction)}

          <div className="mt-6 text-center">
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-full font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700"
            >
              <span>⟲</span>
              <span>Go Back & Predict Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- Main Screen (cards + forms) ----------------

  const hasAnyRiverError = Object.values(errors).some(
    (msg) => typeof msg === "string" && msg.length > 0
  );
  const riverAnyEmpty = RIVER_FIELDS.some((field) => !formData[field.name]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-4">
          <span className="text-blue-500">Water Quality Analyzer</span>
        </h2>

        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Choose a mode below — analyze detailed river parameters or quickly
          rate your tap water quality.
        </p>

        {/* toggle strip */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-full bg-white shadow-md border border-gray-100">
            <button
              type="button"
              onClick={() => {
                setWaterType("river");
                setShowForm(false);
              }}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition ${
                waterType === "river"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              River Mode
            </button>
            <button
              type="button"
              onClick={() => {
                setWaterType("tap");
                setShowForm(false);
              }}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition ${
                waterType === "tap"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Tap Mode
            </button>
          </div>
        </div>

        {!showForm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* River card */}
            <div className="group relative bg-white rounded-3xl shadow-xl p-6 border-2 border-cyan-200 overflow-hidden transform transition hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100/60 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-4 mb-4 relative">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100">
                  <svg
                    className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12s4-8 9-8 9 8 9 8-4 8-9 8-9-8-9-8z"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    River Water
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                      Scientific
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500">
                    Predict ecological status and pollution level of natural
                    water bodies.
                  </p>
                </div>
              </div>

              <ul className="text-xs text-gray-500 space-y-1 mb-4">
                <li>• Uses 8 scientific parameters</li>
                <li>• Strict range validation based on CPCB / literature</li>
                <li>• Blocks invalid inputs before prediction</li>
              </ul>

              <div className="mt-4 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setWaterType("river");
                    setShowForm(true);
                  }}
                  className="inline-flex items-center gap-3 py-3 px-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold shadow-2xl hover:from-blue-600 hover:to-blue-700"
                >
                  <span>Start River Prediction</span>
                </button>
              </div>
            </div>

            {/* Tap card */}
            <div className="group relative bg-white rounded-3xl shadow-xl p-6 border-2 border-sky-200 overflow-hidden transform transition hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-4 mb-4 relative">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <svg
                    className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v4m0 10v4m9-9h-4M7 12H3"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    Tap Water
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Quick Check
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500">
                    Evaluate potability and safety of household drinking water.
                  </p>
                </div>
              </div>

              <ul className="text-xs text-gray-500 space-y-1 mb-4">
                <li>• Select Low / Average / High for each parameter</li>
                <li>• System internally converts to numeric ranges</li>
                <li>• Perfect for non-technical users</li>
              </ul>

              <div className="mt-4 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setWaterType("tap");
                    setShowForm(true);
                  }}
                  className="inline-flex items-center gap-3 py-3 px-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 text-white font-semibold shadow-2xl hover:from-indigo-700 hover:to-indigo-600"
                >
                  <span>Start Tap Prediction</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 w-full max-w-4xl mx-auto">
            {/* Top bar with title + Back + Reset */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  {waterType === "river"
                    ? "River Water Input"
                    : "Tap Water Quality Analysis"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {waterType === "river"
                    ? "Fill in measured values from your test results. Each field is validated with a fixed safe range."
                    : "Select the option that best matches what you feel, see or taste in your tap water."}
                </p>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setShowForm(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
                >
                  <span>←</span>
                  <span>Back</span>
                </button>
                <button
                  onClick={resetAll}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100"
                >
                  <span>⟲</span>
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {waterType === "river" ? (
              <form onSubmit={handleRiverSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {RIVER_FIELDS.map((field) => {
                    const errMsg = errors[field.name];
                    const hasError = !!errMsg;
                    return (
                      <div
                        key={field.name}
                        className={`p-3 rounded-xl border ${
                          hasError
                            ? "border-red-300 bg-red-50/40"
                            : "border-gray-100 bg-gray-50/40"
                        }`}
                      >
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium text-gray-700"
                        >
                          {field.label}
                        </label>
                        <input
                          type="number"
                          name={field.name}
                          id={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          required
                          min={field.min}
                          max={field.max}
                          step="any"
                          className={`mt-1 block w-full px-3 py-2 bg-white border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 sm:text-sm ${
                            hasError
                              ? "border-red-400"
                              : "border-gray-200 focus:border-blue-300"
                          }`}
                          placeholder={field.placeholder}
                        />
                        <p className="mt-1 text-[11px] text-gray-400">
                          {field.hint}{" "}
                          <span className="font-semibold text-gray-500">
                            (Range: {field.min} – {field.max} {field.unit})
                          </span>
                        </p>
                        {hasError && (
                          <p className="mt-1 text-[11px] font-medium text-red-600 flex items-center gap-1">
                            ⚠ {errMsg}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 text-xs text-gray-500 text-center">
                  Note: If any value goes outside the allowed range, prediction
                  will be blocked until you correct it.
                </div>

                <div className="mt-8 flex items-center justify-center">
                  <button
                    type="submit"
                    disabled={isLoading || hasAnyRiverError || riverAnyEmpty}
                    className="inline-flex items-center gap-3 py-3 px-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold shadow-2xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Predicting..." : "Predict River Quality"}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tapParams.map((p) => {
                    const meta = TAP_PARAM_META[p.name] || {
                      icon: "💧",
                      subtitle: p.description || "",
                      lowDesc: "Low level.",
                      avgDesc: "Average / normal level.",
                      highDesc: "High level.",
                    };

                    const getDesc = (level: "Low" | "Average" | "High") => {
                      if (level === "Low") return meta.lowDesc;
                      if (level === "Average") return meta.avgDesc;
                      return meta.highDesc;
                    };

                    return (
                      <div
                        key={p.name}
                        className="flex flex-col h-full rounded-3xl border border-gray-100 bg-gradient-to-b from-slate-50 to-white shadow-sm hover:shadow-md transition overflow-hidden"
                      >
                        {/* header */}
                        <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 text-lg">
                            {meta.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {p.name}
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              {meta.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* options */}
                        <div className="flex-1 px-3 py-3 space-y-2">
                          {(["Low", "Average", "High"] as const).map(
                            (level) => {
                              const isActive = p.value === level;
                              return (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() =>
                                    handleTapParamChange(p.name, level)
                                  }
                                  className={[
                                    "w-full text-left rounded-2xl border px-3 py-2 text-xs transition shadow-sm",
                                    "flex items-start gap-2 relative",
                                    isActive
                                      ? "border-cyan-400 bg-cyan-50/70 shadow-[0_0_0_1px_rgba(34,211,238,0.4)]"
                                      : "border-gray-200 bg-white hover:bg-gray-50",
                                  ].join(" ")}
                                >
                                  <div className="mt-0.5 text-lg">
                                    {level === "Low" && "⬇️"}
                                    {level === "Average" && "✨"}
                                    {level === "High" && "⬆️"}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-800 text-xs">
                                      {level}
                                    </div>
                                    <div className="text-[11px] text-gray-500 leading-snug">
                                      {getDesc(level)}
                                    </div>
                                  </div>

                                  {isActive && (
                                    <span className="absolute right-2 top-2 text-[10px] font-semibold text-cyan-600 bg-white px-2 py-0.5 rounded-full border border-cyan-200">
                                      Selected
                                    </span>
                                  )}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTapSubmit}
                    disabled={isLoading}
                    className="inline-flex items-center gap-3 py-3 px-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 text-white font-semibold shadow-2xl hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-60"
                  >
                    {isLoading ? "Predicting..." : "Predict Tap Quality"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-6 text-center text-red-600 font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Prediction;
