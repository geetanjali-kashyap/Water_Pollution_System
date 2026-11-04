from flask import Blueprint, jsonify, request
from flask import current_app
import joblib
import logging
import math
import os
import sys
import pandas as pd  # for DataFrame inputs (main + tap models)

prediction_bp = Blueprint('prediction_bp', __name__)
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------
# Load old pre-trained model and label encoder (8-features wale model)
# --------------------------------------------------------------------
try:
    model_path = os.path.join(os.path.dirname(__file__), '..', 'ml_models', 'best_water_model.pkl')
    le_path = os.path.join(os.path.dirname(__file__), '..', 'ml_models', 'label_encoder.pkl')

    model = joblib.load(model_path)
    le = joblib.load(le_path)
    logger.info("Loaded pre-trained model and label encoder successfully")
except Exception:
    logger.exception("Could not load the main prediction model or label encoder")
    logger.error("Model path: %s; label encoder path: %s", model_path, le_path)
    model = None
    le = None

# --------------------------------------------------------------------
# NEW: Load tap water model (tap_water.pkl) -> 5 features, string labels
# --------------------------------------------------------------------
try:
    tap_model_path = os.path.join(os.path.dirname(__file__), '..', 'ml_models', 'tap_water.pkl')
    tap_model = joblib.load(tap_model_path)
    logger.info("Loaded tap water model successfully")
except Exception:
    logger.exception("Could not load the tap water model")
    logger.error("Tap model path: %s", tap_model_path)
    tap_model = None


# ------------------------------------------------------------
# HELPER: build input DataFrame for main (8-feature) model
#       -> uses SAME column names as training DataFrame
# ------------------------------------------------------------
def _get_json_object():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ValueError("Request body must be a JSON object.")
    return data


def _to_finite_float(value):
    if isinstance(value, bool):
        raise ValueError("All input values must be numeric.")
    try:
        number = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError("All input values must be numeric.") from exc
    if not math.isfinite(number):
        raise ValueError("All input values must be finite numbers.")
    return number


def build_main_model_df(d):
    """
    Convert JSON body from frontend into a pandas DataFrame with
    the same feature names that were used when fitting the model.
    """

    if not isinstance(d, dict):
        raise ValueError("Request body must be a JSON object.")

    required_fields = [
        "temperature", "dissolvedOxygen", "ph", "conductivity",
        "bod", "nitrate", "fecalColiform", "totalColiform"
    ]
    missing = [f for f in required_fields if d.get(f) is None]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")

    # Values order = joh tum frontend se bhej rahe ho
    values = [
        _to_finite_float(d.get("temperature")),
        _to_finite_float(d.get("dissolvedOxygen")),
        _to_finite_float(d.get("ph")),
        _to_finite_float(d.get("conductivity")),
        _to_finite_float(d.get("bod")),
        _to_finite_float(d.get("nitrate")),
        _to_finite_float(d.get("fecalColiform")),
        _to_finite_float(d.get("totalColiform")),
    ]

    # Model ko jis naam ke features ke saath train kiya gaya tha,
    # wo sklearn model ke andar feature_names_in_ me saved rehte hain.
    default_cols = [
        "Temperature", "Dissolved Oxygen", "pH", "Conductivity",
        "BOD", "Nitrate", "Fecal Coliform", "Total Coliform"
    ]
    feature_names = list(getattr(model, "feature_names_in_", default_cols))

    if len(feature_names) != len(values):
        raise ValueError(
            f"Model expects {len(feature_names)} features but received {len(values)}."
        )

    sample = {feature_names[i]: values[i] for i in range(len(feature_names))}

    df = pd.DataFrame([sample])
    return df


# Routes
# --------------------------------------------------------------------

@prediction_bp.route('/diagnostics', methods=['GET'])
def diagnostics():
    """Return diagnostic information about the model setup."""
    if model is None or le is None:
        main_model_status = "error"
    else:
        main_model_status = "ok"

    if tap_model is None:
        tap_status = "error"
    else:
        tap_status = "ok"

    default_cols = [
        "Temperature", "Dissolved Oxygen", "pH", "Conductivity",
        "BOD", "Nitrate", "Fecal Coliform", "Total Coliform"
    ]
    main_features = list(getattr(model, "feature_names_in_", default_cols)) if model else None

    info = {
        "python_version": sys.version,
        "main_model_status": main_model_status,
        "tap_model_status": tap_status,
        "model_type": type(model).__name__ if model else None,
        "model_path": model_path if model else None,
        "tap_model_path": tap_model_path if tap_model else None,
        "features_main_model": main_features,
        "tap_features": [
            "ph", "Hardness", "Chloramines", "Sulfate", "Turbidity"
        ],
        "classes_main_model": list(le.classes_) if le else None
    }

    try:
        import sklearn
        info["sklearn_version"] = sklearn.__version__
    except Exception as e:
        info["sklearn_version"] = f"not installed ({e})"

    return jsonify(info)


@prediction_bp.route('/predict', methods=['POST'])
def predict():
    """Make a water quality prediction based on input parameters (old 8-feature model)."""
    if model is None or le is None:
        return jsonify({
            "success": False,
            "error": "Model not loaded properly. Check server logs."
        }), 500
    try:
        data = _get_json_object()

        input_df = build_main_model_df(data)

        pred_label = model.predict(input_df)
        prediction = le.inverse_transform(pred_label)[0]

        return jsonify({
            "success": True,
            "prediction": prediction
        })
    except ValueError as ve:
        current_app.logger.info("Invalid /predict request: %s", ve)
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception:
        current_app.logger.exception("Prediction failed for /predict")
        return jsonify({"success": False, "error": "Internal server error"}), 500


@prediction_bp.route('/tap', methods=['POST'])
def predict_tap():
    """Tap endpoint but using main 8-feature model (not tap_water.pkl)."""
    if model is None or le is None:
        return jsonify({"success": False, "error": "Model not loaded properly."}), 500

    try:
        data = _get_json_object()

        input_df = build_main_model_df(data)

        pred_label = model.predict(input_df)
        prediction = le.inverse_transform(pred_label)[0]

        return jsonify({"success": True, "prediction": prediction})
    except ValueError as ve:
        current_app.logger.info("Invalid /tap request: %s", ve)
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception:
        current_app.logger.exception("Prediction failed for /tap")
        return jsonify({"success": False, "error": "Internal server error"}), 500


@prediction_bp.route('/river', methods=['POST'])
def predict_river():
    """River endpoint using main 8-feature model."""
    if model is None or le is None:
        return jsonify({"success": False, "error": "Model not loaded properly."}), 500
    try:
        data = _get_json_object()

        input_df = build_main_model_df(data)

        pred_label = model.predict(input_df)
        prediction = le.inverse_transform(pred_label)[0]

        return jsonify({"success": True, "prediction": prediction})
    except ValueError as ve:
        current_app.logger.info("Invalid /river request: %s", ve)
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception:
        current_app.logger.exception("Prediction failed for /river")
        return jsonify({"success": False, "error": "Internal server error"}), 500


# --------------------------------------------------------------------
# NEW: /tap-status — uses tap_water.pkl (5 features, no label encoder)
# --------------------------------------------------------------------
@prediction_bp.route('/tap-status', methods=['POST'])
def predict_tap_status():
    """
    Predict tap water status using tap_water.pkl model.
    Input JSON:
    {
        "ph": ...,
        "Hardness": ...,
        "Chloramines": ...,
        "Sulfate": ...,
        "Turbidity": ...
    }
    Output:
    {
        "success": true,
        "prediction": "Low" / "Average" / "High"
    }
    """
    if tap_model is None:
        return jsonify({"success": False, "error": "Tap water model not loaded."}), 500

    try:
        data = _get_json_object()

        required_fields = ["ph", "Hardness", "Chloramines", "Sulfate", "Turbidity"]
        missing = [f for f in required_fields if data.get(f) is None]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")

        # Build DataFrame with same columns used in training
        sample = {
            "ph": _to_finite_float(data["ph"]),
            "Hardness": _to_finite_float(data["Hardness"]),
            "Chloramines": _to_finite_float(data["Chloramines"]),
            "Sulfate": _to_finite_float(data["Sulfate"]),
            "Turbidity": _to_finite_float(data["Turbidity"])
        }

        X_new = pd.DataFrame([sample])

        pred = tap_model.predict(X_new)[0]  # already "Low"/"Average"/"High"

        return jsonify({
            "success": True,
            "prediction": pred
        })
    except ValueError as ve:
        current_app.logger.info("Invalid /tap-status request: %s", ve)
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception:
        current_app.logger.exception("Prediction failed for /tap-status")
        return jsonify({"success": False, "error": "Internal server error"}), 500
