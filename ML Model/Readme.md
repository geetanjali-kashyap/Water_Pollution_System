# 🌊 Water Pollution Predict System – Model Training Steps

This project has **2 ML models** trained **individually**:

- 🟦 Tap Water Quality Model → `tap_water.pkl`
- 🟩 River Water Quality Model → `best_water_model.pkl`

Below are **short step-wise notes** on how each model is trained (based on your code).

---

## 🟦 Tap Water Quality Model (tap_water.pkl)

### 🔹 Dataset
- File used: `water_potability.csv`
- Columns used:
  - `ph`
  - `Hardness`
  - `Chloramines`
  - `Sulfate`
  - `Turbidity`

### 🧠 Training Steps

1. **Load Data**
   - Read CSV → `df = pd.read_csv("water_potability.csv")`
   - Keep only 5 columns.

2. **Convert & Clean**
   - Convert all 5 columns to numeric (`errors="coerce"`).
   - Missing values filled with **median** of each column.

3. **Create Label `Status` (Low / Average / High)**
   - For each parameter:
     - Use `categorize(value, low, high)` → returns `"Low" / "Average" / "High"`.
   - Overall `Status` per row:
     - If any parameter = `"High"` → `Status = "High"`
     - Else if any parameter = `"Low"` → `Status = "Low"`
     - Else → `Status = "Average"`.

4. **Prepare X & y**
   - `X` = 5 numeric columns.
   - `y` = `Status`.

5. **Train–Test Split**
   - `train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)`.

6. **Build ML Pipeline**
   - `SimpleImputer(strategy="median")`
   - `StandardScaler()`
   - `RandomForestClassifier(random_state=42)`  
   (All wrapped in `Pipeline`.)

7. **Hyperparameter Tuning (GridSearchCV)**
   - Grid on:
     - `n_estimators`: `[100, 200]`
     - `max_depth`: `[None, 10, 20]`
   - 5-fold CV, scoring = accuracy.
   - Get `best_estimator_` as `best_model`.

8. **Evaluate**
   - Predict on test data.
   - Print:
     - Accuracy
     - Classification report
     - Confusion matrix (Heatmap).

9. **Save Model**
   - Save pipeline as:
     - `tap_water.pkl` using `joblib.dump(best_model, MODEL_PATH)`.

---

## 🟩 River Water Quality Model (best_water_model.pkl)

### 🔹 Dataset
- File used: `Complete_Dataset.csv` (CPCB river data)
- `skiprows=2` because of header/metadata.

### 🧠 Training Steps

1. **Load Data**
   - `df = pd.read_csv("Complete_Dataset.csv", encoding="latin1", skiprows=2)`.
   - Rename all columns (Station Code, Min/Max for each parameter, etc.).

2. **Convert to Numeric + Fill Missing**
   - For all Min/Max columns:
     - Convert to numeric (`errors='coerce'`).
     - Fill missing values with **median**.

3. **Feature Engineering (Average Values)**
   - For each parameter:
     - Avg = `(Min + Max) / 2`
     - New columns:
       - `Temperature (°C)`
       - `Dissolved Oxygen (mg/L)`
       - `pH`
       - `Conductivity (µmho/cm)`
       - `BOD (mg/L)`
       - `Nitrate N (mg/L)`
       - `Fecal Coliform (MPN/100ml)`
       - `Total Coliform (MPN/100ml)`
   - Drop all original Min/Max columns.
   - Drop `Fecal Streptococci` column.

4. **Create Label `pollution_status` (Clean / Moderate / Polluted)**
   - Apply rule-based function:
     - If strict good conditions → `"Clean"`
     - Else if moderate conditions → `"Moderate"`
     - Else → `"Polluted"`.
   - Create numeric label:
     - `pollution_label = LabelEncoder().fit_transform(pollution_status)`.

5. **Prepare X & y**
   - `X` uses 8 final features:
     - `Temperature (°C)`
     - `Dissolved Oxygen (mg/L)`
     - `pH`
     - `Conductivity (µmho/cm)`
     - `BOD (mg/L)`
     - `Nitrate N (mg/L)`
     - `Fecal Coliform (MPN/100ml)`
     - `Total Coliform (MPN/100ml)`
   - `y` = `pollution_label`.

6. **Train–Test Split**
   - `train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)`.

7. **Hyperparameter Tuning**  
   **(a) RandomForest:**
   - Grid:
     - `n_estimators`: `[100, 200]`
     - `max_depth`: `[None, 8, 12]`
     - `min_samples_split`: `[2, 5]`
   - `GridSearchCV` with `StratifiedKFold`, scoring = accuracy.
   - Get `best_rf`.

   **(b) XGBoost:**
   - Grid:
     - `n_estimators`: `[100, 200]`
     - `max_depth`: `[3, 5]`
     - `learning_rate`: `[0.05, 0.1]`
   - `GridSearchCV` → get `best_xgb`.

8. **Train Final RandomForest**
   - `best_rf.fit(X_train, y_train)`.
   - Evaluate:
     - Accuracy
     - Classification report
     - Confusion matrix (Heatmap).
   - Plot feature importances.

9. **Stacking Classifier**
   - Base models:
     - Tuned `best_rf`
     - Tuned `best_xgb`
     - `SVC(probability=True)`
   - Meta model:
     - `LogisticRegression`.
   - `StackingClassifier(...).fit(X_train, y_train)`.
   - Evaluate stacking model on `X_test`.

10. **Select Best Model**
    - Compare:
      - `acc_rf` vs `acc_stack`.
    - If stacking is better → choose stacking, else RF.
    - Final selected = `best_model`.

11. **Save Model & Encoder**
    - `joblib.dump(best_model, "best_water_model.pkl")`
    - `joblib.dump(le, "label_encoder.pkl")`.

12. **User Input Prediction (CLI)**
    - Take 8 inputs from user (Temperature, DO, pH, Conductivity, BOD, Nitrate, Fecal, Total).
    - Create `user_df` with same 8 feature columns.
    - Predict using `best_model.predict(user_df)`.
    - Convert numeric result back to `"Clean / Moderate / Polluted"` using `label_encoder`.

---

## ✅ Quick Summary

- **Tap Model (`tap_water.pkl`)**
  - Data → Clean (Median) → Threshold-based `Status` → RF+GridSearch → Save.

- **River Model (`best_water_model.pkl`)**
  - Data → Numeric + Median → Min/Max → Average → Rule-based `pollution_status` → RF/XGB tuned → Stacking → Best Model → Save + Encoder.

---

