from flask import Flask
from extensions import db, mail, migrate
from flask_cors import CORS
import os
import secrets
from dotenv import load_dotenv

load_dotenv()


def create_app(config=None):
    """
    Application factory. Creates and configures the Flask app instance.
    """
    app = Flask(__name__)

    # ----------------------------------------------------
    # CORS configuration
    # ----------------------------------------------------
    # By default we allow:
    #   - Local Vite dev frontend:  http://localhost:5173
    #   - Localhost alias:          http://127.0.0.1:5173
    #   - Render frontend:          https://water-pollution-prediction.onrender.com
    #
    # If you set CORS_ORIGINS in env, that will override this list (comma separated).
    default_origins_list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://water-pollution-prediction.onrender.com",
    ]

    cors_origins_env = os.getenv("CORS_ORIGINS")
    if cors_origins_env:
        # Example env value:
        # CORS_ORIGINS=http://localhost:5173,https://water-pollution-prediction.onrender.com
        cors_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
    else:
        cors_origins = default_origins_list

    app.logger.info("CORS allowed origins: %s", cors_origins)

    # We are using token in Authorization header (not cookies),
    # so supports_credentials=False is enough.
    CORS(
        app,
        resources={r"/api/*": {"origins": cors_origins}},
        supports_credentials=False,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    # ----------------------------------------------------
    # App configuration
    # ----------------------------------------------------

    # Secret key (used by Flask for session/CSRF etc.)
    # NOTE: In production you should normally fix this via env var,
    # but for now we generate a random one if missing.
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", secrets.token_hex(16))

    # ---------------- Email configuration ----------------
    app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 587))
    app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS", "True").lower() == "true"
    app.config["MAIL_USE_SSL"] = os.getenv("MAIL_USE_SSL", "False").lower() == "true"
    app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
    app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
    app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_USERNAME")

    # ---------------- Database configuration ----------------
    username = os.getenv("DB_USERNAME")
    password = os.getenv("DB_PASSWORD")
    database = os.getenv("DB_NAME")
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")

    database_config_missing = not all([username, password, database, host, port])
    if database_config_missing:
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
    else:
        app.config[
            "SQLALCHEMY_DATABASE_URI"
        ] = f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    if config:
        app.config.update(config)

    if not app.config["MAIL_USERNAME"] or not app.config["MAIL_PASSWORD"]:
        app.logger.warning("MAIL_USERNAME or MAIL_PASSWORD is not configured.")
    if database_config_missing and not (
        config and "SQLALCHEMY_DATABASE_URI" in config
    ):
        app.logger.warning("Database configuration is incomplete; falling back to SQLite.")

    # Initialize extensions with app
    db.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)  # Flask-Migrate

    # ----------------------------------------------------
    # Register models and blueprints
    # ----------------------------------------------------
    with app.app_context():
        from models.user import User  # noqa: F401
        from models.otp import OTP  # noqa: F401
        from routes.auth_route import auth_bp
        app.register_blueprint(auth_bp, url_prefix="/api/auth")

        try:
            db.create_all()
        except Exception:
            app.logger.exception("Database setup failed")

        # Register prediction routes (no DB dependency required here)
        from routes.prediction_route import prediction_bp

        app.register_blueprint(prediction_bp, url_prefix="/api/prediction")

    return app


# Create the application instance for WSGI servers (Gunicorn, Render, etc.)
app = create_app()

if __name__ == "__main__":
    # For local development
    app.run(debug=True)
