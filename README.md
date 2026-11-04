# &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **🚰 **Water Pollution Predict System****

<br>

<br>



- A Machine Learning–based web application that predicts water quality for **Tap Water** and **River Water** using scientifically validated environmental parameters.  
- The system helps identify **Low / Average / High** potability for tap water and **Clean / Moderate / Polluted** status for river water.
- This project supports environmental safety by enabling early awareness of water contamination.


<br>



<img width="1354" height="610" alt="image" src="https://github.com/user-attachments/assets/f45709d3-e787-400d-9a95-e5cd42a81056" />

<br>
<br>

---

## 👨‍💻 **Team Details**

### **Team — Bit Brains**

| Member | Role | Email |
|--------|------|-------|
| Dr. Jyoti Tripati | Mentor | jyoti.tripathi@dseu.ac.in |
| Ambuj Kumar Singh  |Frontend | ambujks2002@gmail.com |
| Chetan | Backend & ML Developer | Chetankashyap951@gmail.com |
| Shivam Sahu | Frontend | 26shivam10@gmail.com |
| Shravan | Backend & ML Developer | mandalshravan2004@gmail.com |


---
<br>

## 🛠 **Tech Stack**

### 🔹 Machine Learning & Data Processing
- Python 3.x  
- Pandas, NumPy  
- Scikit-Learn  
- XGBoost  
- LabelEncoder  
- Matplotlib

### 🔹 Backend / API (optional deployment)
- Flask / FastAPI  
- Model Loading & Prediction Response  
- JSON API Support  

### 🔹 Frontend UI (optional deployment)
- React.js  
- Form-based real-time prediction input  
- Charts for visualization  
- Fetch API / Axios

### 🔹 Database 
- MySQL (for storing prediction logs & dataset uploads)

<br>

---


### 🌍 Data Sources
| Dataset | Source | Format |
|--------|--------|--------|
| Tap Water | Kaggle | CSV |
| River Water | CPCB – NWMP (India Govt.) | PDF → CSV Converted |


#### 🎯 This system aims to make **Water Quality Assessment**
✔ Simple  
✔ Accurate  
✔ Understandable to everyone

> 💧 **Save Water • Save Life — Every Drop Matters!**  

<br>


---

## 📌 Overview

This project aims to classify **Tap Water** and **River Water** quality into:

> 🔹 **Low Quality**  
> 🔹 **Average Quality**  
> 🔹 **High Quality**

Two different machine learning models are trained:

| Model | Dataset Type | Used For | # Features |
|-------|--------------|----------|------------|
| 🟦 Tap Water Model | Supervised ML | Drinking water potability | 5 |
| 🟩 River Water Model | Real-world environmental data | River pollution analysis | 8 |

This project helps in:
- ✨ Public health awareness
- ✨ Real-time water monitoring
- ✨ Environmental conservation

<br>


---

## 📂 Dataset Information

### 🟦 Tap Water Dataset (Supervised Model Training)

- **Source**: Kaggle  
- 🔗 https://www.kaggle.com/datasets/uom190346a/water-quality-and-potability
- Contains validated tap water measurements
- Missing values filled using **Median Imputation**

#### Parameters Used:
| Feature | Description |
|--------|-------------|
| pH | Acidity / Alkalinity |
| Hardness | Minerals like Calcium/Magnesium |
| Chloramines | Disinfectant chemical |
| Sulfate | Mineral concentration |
| Turbidity | Water clarity |

Used for **classification model training & evaluation**.

<br>


---

### 🟩 River Water Dataset (Real-World CPCB Reports)

- **Source**: CPCB — National Water Monitoring Program (India)
- 🔗 https://cpcb.nic.in/nwmp-data/
- Available **only in PDF format**
- Extracted **last 8 years** dataset using:
  - `pdfplumber`
  - Manual corrections + cleaning
- Converted to **CSV format**

#### Parameters Used:
| Feature | Purpose |
|--------|---------|
| Temperature | Affects aquatic life health |
| Dissolved Oxygen | Key indicator of water purity |
| pH | Water acidity level |
| Conductivity | Presence of ions / chemicals |
| BOD (mg/L) | Biodegradable organic waste |
| Nitrate-N | Fertilizer pollutants |
| Fecal Coliform | Indicates pathogen risk |
| Total Coliform | Microbial contamination |

Used for:
- 🌍 Pollution analytics
- 📉 Trend forecasting
- 🔬 Real-world model validation

<br>


---

## 🤖 Machine Learning Workflow

| Step | Description |
|------|-------------|
| 1️⃣ | Load dataset(s) |
| 2️⃣ | Numeric conversion + Missing value handling |
| 3️⃣ | Create label category (Low / Average / High) using thresholds |
| 4️⃣ | Train/Test split with stratified sampling |
| 5️⃣ | ML Pipeline → Imputation → Scaling → RandomForest |
| 6️⃣ | Hyperparameter Tuning using GridSearchCV |
| 7️⃣ | Evaluation via multiple metrics |
| 8️⃣ | Save trained models (`tap_water.pkl` + `river_water.pkl`) |

<br>


---

## 📊 Model Evaluation & Insights

Both models include:

✔ Accuracy Score  
✔ Precision / Recall / F1-Score  
✔ Confusion Matrix Plot   
✔ Feature Importance Graph  
✔ Cross-Validation Performance Graph  

These insights ensure the model is **reliable** & **accurate** for real usage.

<br>


---


## 🎯 Key Outcomes

- 💧 Automated Potability check for tap water
- 🌍 River water pollution detection from government data
- 🚦 Simple traffic-light style water status for normal users
- 🧪 Tested with real-world datasets
- 🇮🇳 Built for Indian environmental monitoring needs

<br>


---

#  API Overview

Short notes of **all important APIs** used in this project,  
with **endpoint + HTTP method + purpose** 💧


Backend: RESTful API built using Flask (Blueprints).

----------------- API Endpoints (Examples) ------------------------

------------------------------------------------------------------------------
| Method | Endpoint                     | Description                          |
|--------|------------------------------|--------------------------------------|
| `POST` | `/auth/register`             | Register a new user                  |
| `POST` | `/auth/login`                | Login user and get auth token        |
| `POST` | `/auth/validate-token`       | Validate existing auth token         |
| `GET`  | `/auth/logout`               | Logout user (clear session)          |
| `POST` | `/auth/forgot-password`      | Send OTP for password reset          |
| `POST` | `/auth/verify-otp`           | Verify OTP entered by user           |
| `POST` | `/auth/reset-password`       | Reset password using verified OTP    |
| `GET`  | `/water/diagnostics`         | Get model + feature diagnostics      |
| `POST` | `/water/predict`             | General 8-feature water prediction   |
| `POST` | `/water/river`               | Predict river water status           |
| `POST` | `/water/tap`                 | Predict tap status (8-feature model) |
| `POST` | `/water/tap-status`          | Predict tap status (5-feature model) |
------------------------------------------------------------------------------


<br>





#  Project Setup Guide

This guide explains how to set up and run the **Water Pollution Predict System** backend locally using Flask.

---

## 🛠 Requirements

Before starting, make sure you have installed:

- Python 3.8+
- pip (Python package manager)
- Git
- MySQL 

---

## 🚀 Steps to Run Backend (Local Setup)

### 1️⃣ Clone the Repository
- git clone https://github.com/KASHYAPCHETAN438/Water-Pollution-Prediction.git
    - cd water-pollution-prediction
    - cd Backend

### 2️⃣ Create Virtual Environment
- python -m venv venv

### 3️⃣ Activate Virtual Environment
- venv\Scripts\activate

### 4️⃣ Install All Dependencies
- pip install -r requirements.txt

### 5️⃣ Update .env File in Project Root

**🔐 Environment Configuration**


- -------------- DB Configuration ----------
 
    - DB_USERNAME=root
    - DB_PASSWORD=yourpassword
    - DB_NAME=sqlalchemy  (Database Name)
    - DB_HOST=localhost
    - DB_PORT=3306

- ------------- SMTP Configuration ----------
    - SECRET_KEY=yourSecretKeyHere
    - MAIL_USERNAME=yourEmail@gmail.com
    - MAIL_PASSWORD=yourEmailAppPassword
    - MAIL_SERVER=smtp.gmail.com
    - MAIL_PORT=587
    - MAIL_USE_TLS=True


### 7️⃣ Run Flask Application
- python app.py


## 🚀 Steps to Run Frontend (Local Setup)

### 1️⃣ Go to Frontend Folder
- Open terminal inside project folder and run:
     - cd frontend

### 2️⃣ Install Required Node Packages
- npm install

### 3️⃣ Start Frontend Server
- npm run start
    OR
- npm run dev


<br>

---


## 🔮 Future Scope

| Feature | Impact |
|--------|--------|
| IoT Sensor Live Monitoring | Real-time water status |
| Google Maps Pollution Heatmap | Region-wise alerting |
| More CPCB datasets | Broader national coverage |
| Mobile App + Voice Support | User-friendly accessibility |
| Explainability via SHAP | Scientific transparency |


<br>



---
## 🌐 Live Demo is Now Live! 🚀  

Experience the **Water Pollution Prediction System** in action:  

👉 **Visit Now:**  
🔗 https://water-pollution-prediction.onrender.com  

✨ What you can do on the live site:  
- 💧 Predict **Tap Water** & **River Water** quality  
- 📊 View **pollution levels** as Low / Average / High  
- 📉 Explore **ML-powered** predictions with a clean UI  
- 📱 Fully responsive – works on mobile & desktop  






