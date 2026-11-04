# 🌊 **Water Pollution Predict System**

---

## 📂 **Dataset Information**

This project uses **two separate datasets** to predict water quality for both **drinking** and **river** water sources.

---

### 🟦✨ Tap Water Quality Dataset (Model Training)

📌 Used to train the **Tap Water Classification Model**  
✔ Suitable for **drinking water potability** testing  

- **Source**: Kaggle  
- 🔗 Dataset Link:  
  https://www.kaggle.com/datasets/uom190346a/water-quality-and-potability

#### 📊 Parameters Included:
| Feature | Meaning |
|--------|---------|
| pH | Acidity / Alkalinity level |
| Hardness | Essential mineral concentration |
| Chloramines | Chemical disinfectant level |
| Sulfate | Mineral presence in water |
| Turbidity | Clarity / visibility of water |

⚙️ Missing values handled using: **Median Imputation**  
🎯 Labels generated → **Low**, **Average**, **High**  
🧠 Used for **Supervised Machine Learning**

---

### 🟩🌍 River Water Quality Dataset (Real-World Monitoring)

📌 Used to evaluate **environmental pollution & river health**  

- **Source**: CPCB India – National Water Monitoring Programme  
- 🔗 Dataset Link:  
  https://cpcb.nic.in/nwmp-data/

📝 Data Collection Details:
- Data available **only in PDF format**
- Extracted using `pdfplumber`
- Records from **last 8 years**
- Cleaned & converted into **CSV format**

#### 📊 Parameters Included:
| Feature | Importance |
|--------|------------|
| Temperature | Affects aquatic life & oxygen balance |
| Dissolved Oxygen | Indicates purity & ecological health |
| pH | Acidic or alkaline nature |
| Conductivity | Indicates dissolved ions / pollution |
| BOD (mg/L) | Biodegradable organic waste level |
| Nitrate-N | Agricultural & sewage contamination |
| Fecal Coliform | Pathogenic contamination indicator |
| Total Coliform | Microbial pollution severity |

🌐 Used for:
- Pollution visual analytics  
- Trend analysis  
- Real-world ML model validation  

---

## 📎 Dataset Drive Link

📌 Access all preprocessed CSV files here:  
🔗 https://drive.google.com/drive/folders/1CldmC6X9Zx7qk_TvwaUBbupsBVoUcYqo?usp=sharing

---

✨ Both datasets together help assess **public health safety** & **environmental quality** 💧🌱

---
