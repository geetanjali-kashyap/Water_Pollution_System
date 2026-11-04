from flask import Blueprint, render_template, request, redirect, url_for, session, jsonify, current_app
from flask_mail import Message
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db, mail
from models.user import User
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from models.otp import OTP
import re

# NEW: for smtp-test debug route
import smtplib
import os

auth_bp = Blueprint('auth_bp', __name__)

# Token expiry time in seconds (1 hour = 3600 seconds)
TOKEN_EXPIRY = 3600


def _get_json_payload():
    payload = request.get_json(silent=True)
    return payload if isinstance(payload, dict) else None


"""
IMPORTANT (for Brevo SMTP):

Flask config / .env me ye values set karo:

MAIL_SERVER = 'smtp-relay.brevo.com'
MAIL_PORT = 587
MAIL_USE_TLS = True
MAIL_USE_SSL = False
MAIL_USERNAME = '<your Brevo SMTP login email>'
MAIL_PASSWORD = '<your Brevo SMTP key>'   # SMTP key, NOT API key
"""


def make_serializer():
    secret = current_app.config.get('SECRET_KEY', None)
    return URLSafeTimedSerializer(secret) if secret else None


def validate_token(token):
    """Validate token and check expiry. Returns user_id if valid, None if invalid/expired."""
    try:
        serializer = make_serializer()
        if not serializer or not token:
            return None
        # max_age in seconds — token expires after TOKEN_EXPIRY seconds
        data = serializer.loads(token, max_age=TOKEN_EXPIRY)
        return data.get('user_id')
    except SignatureExpired:
        current_app.logger.info("Authentication token expired")
        return None
    except BadSignature:
        current_app.logger.info("Invalid authentication token signature")
        return None
    except Exception:
        current_app.logger.exception("Token validation failed")
        return None


# ========== SMTP TEST ROUTE (for Render debugging) ==========
@auth_bp.route('/smtp-test', methods=['GET'])
def smtp_test():
    """
    Simple endpoint to test SMTP connectivity + login.
    HIT: GET /api/auth/smtp-test

    Ye route ab Brevo SMTP ke liye bhi kaam karega,
    bas config / env sahi set honi chahiye (MAIL_* vars).
    """

    # Prefer Flask config (app.config) but fallback to env if needed
    email = current_app.config.get("MAIL_USERNAME") or os.getenv("MAIL_USERNAME")
    password = current_app.config.get("MAIL_PASSWORD") or os.getenv("MAIL_PASSWORD")

    # Brevo defaults
    host = current_app.config.get("MAIL_SERVER", "smtp-relay.brevo.com")
    port = int(current_app.config.get("MAIL_PORT", 587))
    use_tls = str(current_app.config.get("MAIL_USE_TLS", "True")).lower() == "true"
    use_ssl = str(current_app.config.get("MAIL_USE_SSL", "False")).lower() == "true"

    try:
        current_app.logger.info(f"SMTP TEST: connecting to {host}:{port}")
        if use_ssl:
            # If you ever switch to port 465 + SSL
            server = smtplib.SMTP_SSL(host, port, timeout=10)
        else:
            server = smtplib.SMTP(host, port, timeout=10)

        server.ehlo()

        # TLS (STARTTLS) use kar rahe ho to
        if use_tls and not use_ssl:
            current_app.logger.info("SMTP TEST: starting TLS")
            server.starttls()
            server.ehlo()

        current_app.logger.info("SMTP TEST: logging in as %s", email)
        server.login(email, password)

        server.quit()
        return jsonify({"ok": True, "message": "SMTP connect + login success"}), 200

    except Exception as e:
        current_app.logger.exception("SMTP TEST ERROR")
        return jsonify({
            "ok": False,
            "error": str(e),
            "type": type(e).__name__,
        }), 500


# ---------------- Home Page ----------------
@auth_bp.route('/')
def home():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            return f"Welcome back, {user.name}! You're already logged in."
    return render_template('auth.html')


# ---------------- Register Route ----------------
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        # Support JSON requests (from frontend) or form-data (from templates)
        payload = _get_json_payload()
        if payload:
            name = payload.get('name')
            email = payload.get('email')
            password = payload.get('password')
            confirm_password = payload.get('confirm_password')
        else:
            name = request.form.get('name')
            email = request.form.get('email')
            password = request.form.get('password')
            confirm_password = request.form.get('confirm_password')

        if not all([name, email, password, confirm_password]):
            return jsonify({'success': False, 'message': 'All fields are required.'}), 400

        if not all(
            isinstance(value, str)
            for value in (name, email, password, confirm_password)
        ):
            return jsonify({'success': False, 'message': 'All fields must be text.'}), 400

        if password != confirm_password:
            return jsonify({'success': False, 'message': 'Passwords do not match.'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'message': 'Email already registered.'}), 409

        # Hash password before storing
        hashed_password = generate_password_hash(password)
        user = User(name=name, email=email, password=hashed_password)

        db.session.add(user)
        db.session.commit()

        # --------------- Send Welcome Email ---------------
        try:
            msg = Message(
                subject=f"🎉 Welcome to Our Platform, {name}! 🌱✨",
                recipients=[email],
                html=f"""
                        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f9ff; padding: 20px; border-radius: 10px;">
        
                        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3a8ef6, #6f3af6); border-radius: 10px; color: white;">
                        <h2 style="margin: 0; font-size: 28px;">Welcome Aboard, {name}! 👋</h2>
                         <p style="margin-top: 8px; font-size: 16px;">We're thrilled to have you with us!</p>
                         </div>

                         <div style="padding: 20px; background: #ffffff; border-radius: 10px; margin-top: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.06);">
                         <p style="font-size: 15px; color: #333; line-height: 1.6;">
                         Thanks for registering with us! 🌟<br><br>
                         You now have full access to explore our water quality prediction tools 🚀
                        </p>

                        <div style="text-align: center; margin: 20px 0;">
                        <a href="https://your-website-url/login" 
                        style="text-decoration:none; background: #3a8ef6; color: #fff; padding: 12px 25px; border-radius: 50px; font-size: 16px; display: inline-block;">
                       🔐 Login & Get Started
                        </a>
                        </div>

                         <p style="font-size: 14px; color: #777;">
                         If you have any questions or need support, feel free to reply to this email anytime 💬
                         </p>
                         </div>

                         <div style="text-align:center; margin-top:15px; color: #888; font-size: 13px;">
                         <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                         <p>With gratitude 💧<br><strong>Your Platform Team</strong></p>
                         </div>
                         </div>
                            """
            )

            mail.send(msg)
            current_app.logger.info("Welcome email sent to %s", email)
        except Exception:
            current_app.logger.exception("Welcome email could not be sent")
            # Registration succeeded even if email failed; inform frontend
            return jsonify({'success': True, 'message': 'Registration successful, but welcome email could not be sent.'}), 201

        return jsonify({'success': True, 'message': 'Registration successful.'}), 201

    except IntegrityError:
        db.session.rollback()
        current_app.logger.info("Registration rejected by a database constraint")
        return jsonify({
            'success': False,
            'message': 'Email already registered or account data conflicts with an existing record.'
        }), 409
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Registration failed")
        return jsonify({
            'success': False,
            'message': 'An error occurred during registration. Please try again.'
        }), 500


# ---------------- Login Route ----------------
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        payload = _get_json_payload()
        if payload:
            email = payload.get('email')
            password = payload.get('password')
        else:
            email = request.form.get('email')
            password = request.form.get('password')

        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

        if not isinstance(email, str) or not isinstance(password, str):
            return jsonify({'success': False, 'message': 'Email and password must be text.'}), 400

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            # Create a signed token that the frontend can store
            serializer = make_serializer()
            token = serializer.dumps({'user_id': user.id}) if serializer else ''
            return jsonify({'success': True, 'message': f'Welcome back, {user.name}!', 'token': token}), 200
        else:
            return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

    except Exception:
        current_app.logger.exception("Login failed")
        return jsonify({
            'success': False,
            'message': 'An error occurred during login. Please try again.'
        }), 500


# ---------------- Logout Route ----------------
@auth_bp.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('auth_bp.home'))


# ========== NEW: Validate Token Endpoint ==========
@auth_bp.route('/validate-token', methods=['POST'])
def validate_token_endpoint():
    """Check if token is still valid. Frontend calls this periodically."""
    try:
        payload = _get_json_payload()
        token = payload.get('token') if payload else None

        if not token:
            return jsonify({'valid': False, 'message': 'No token provided'}), 401

        user_id = validate_token(token)
        if user_id:
            user = db.session.get(User, user_id)
            if user:
                return jsonify({'valid': True, 'user_id': user_id, 'user_name': user.name}), 200

        return jsonify({'valid': False, 'message': 'Token expired or invalid'}), 401
    except Exception:
        current_app.logger.exception("Token validation endpoint failed")
        return jsonify({'valid': False, 'message': 'Server error'}), 500


# ========== NEW: Forgot Password - Send OTP ==========
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Send OTP to user email for password reset."""
    try:
        payload = _get_json_payload()
        email = payload.get('email') if payload else request.form.get('email')

        if not isinstance(email, str) or not email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400

        # Validate email format
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return jsonify({'success': False, 'message': 'Invalid email format'}), 400

        # Check if user exists
        user = User.query.filter_by(email=email).first()
        if not user:
            # For security, don't reveal if email exists or not
            return jsonify({'success': True, 'message': 'If email exists, OTP has been sent'}), 200

        # Delete any existing OTP for this email to avoid unique constraint issues
        try:
            existing = OTP.query.filter_by(email=email).first()
            if existing:
                db.session.delete(existing)
                db.session.commit()
        except Exception:
            db.session.rollback()
            current_app.logger.exception('Failed to delete existing OTP')

        # Generate new OTP
        try:
            otp_obj = OTP(email=email)
            db.session.add(otp_obj)
            db.session.commit()
        except Exception:
            db.session.rollback()
            current_app.logger.exception('Failed to create OTP object')
            return jsonify({'success': False, 'message': 'Server error creating OTP'}), 500

        # Send OTP via email
        try:
            msg = Message(
                subject="🔐 Password Reset OTP - Water Quality Analyzer",
                recipients=[email],
                html=f"""
                <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f9ff; padding: 20px; border-radius: 10px;">
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3a8ef6, #6f3af6); border-radius: 10px; color: white;">
                        <h2 style="margin: 0; font-size: 28px;">Password Reset Request 🔒</h2>
                        <p style="margin-top: 8px; font-size: 16px;">We received a request to reset your password</p>
                    </div>

                    <div style="padding: 20px; background: #ffffff; border-radius: 10px; margin-top: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.06);">
                        <p style="font-size: 15px; color: #333; line-height: 1.6;">
                            Use this One-Time Password (OTP) to reset your password:<br><br>
                        </p>

                        <div style="text-align: center; margin: 20px 0;">
                            <div style="background: #f0f7ff; padding: 20px; border-radius: 10px; border: 2px dashed #3a8ef6;">
                                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #3a8ef6; letter-spacing: 5px;">
                                    {otp_obj.otp_code}
                                </p>
                            </div>
                        </div>

                        <p style="font-size: 13px; color: #e74c3c; text-align: center;">
                            ⏰ This OTP will expire in 10 minutes
                        </p>

                        <p style="font-size: 14px; color: #777; margin-top: 20px;">
                            If you didn't request this, please ignore this email. Your account is safe. 🛡️
                        </p>
                    </div>

                    <div style="text-align:center; margin-top:15px; color: #888; font-size: 13px;">
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p>For security 🔒<br><strong>Water Quality Analyzer Team</strong></p>
                    </div>
                </div>
                """
            )
            mail.send(msg)
            current_app.logger.info("Password reset OTP email sent to %s", email)
        except Exception:
            # Don't fail the whole request if email sending isn't configured (dev environment)
            current_app.logger.exception("Password reset OTP email could not be sent")
            # Continue and return success to frontend to avoid exposing internal SMTP config

        return jsonify({'success': True, 'message': 'If email exists, OTP has been sent'}), 200

    except Exception:
        current_app.logger.exception("Forgot password failed")
        return jsonify({'success': False, 'message': 'Server error'}), 500


# ========== NEW: Verify OTP ==========
@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify OTP code sent to user email."""
    try:
        payload = _get_json_payload()
        email = payload.get('email') if payload else None
        otp_code = payload.get('otp_code') if payload else None

        if (
            not isinstance(email, str)
            or not email
            or not isinstance(otp_code, str)
            or not otp_code
        ):
            return jsonify({'success': False, 'message': 'Email and OTP code are required'}), 400

        # Find OTP record
        otp_obj = OTP.query.filter_by(email=email).first()
        if not otp_obj:
            return jsonify({'success': False, 'message': 'No OTP found for this email'}), 404

        # Verify OTP
        is_valid, message = otp_obj.verify(otp_code)
        if not is_valid:
            return jsonify({'success': False, 'message': message}), 400

        # OTP verified
        db.session.commit()
        return jsonify({'success': True, 'message': 'OTP verified successfully'}), 200

    except Exception:
        current_app.logger.exception("OTP verification failed")
        return jsonify({'success': False, 'message': 'Server error'}), 500


# ========== NEW: Reset Password ==========
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password after OTP verification."""
    try:
        payload = _get_json_payload()
        email = payload.get('email') if payload else None
        otp_code = payload.get('otp_code') if payload else None
        new_password = payload.get('new_password') if payload else None
        confirm_password = payload.get('confirm_password') if payload else None

        values = (email, otp_code, new_password, confirm_password)
        if not all(isinstance(value, str) for value in values):
            return jsonify({'success': False, 'message': 'All fields must be text'}), 400

        if not all(values):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400

        if new_password != confirm_password:
            return jsonify({'success': False, 'message': 'Passwords do not match'}), 400

        if len(new_password) < 6:
            return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400

        # Verify OTP is valid and verified
        otp_obj = OTP.query.filter_by(email=email).first()
        if (
            not otp_obj
            or not otp_obj.is_verified
            or otp_obj.otp_code != otp_code
        ):
            return jsonify({'success': False, 'message': 'OTP not verified or expired'}), 400

        if otp_obj.is_expired():
            return jsonify({'success': False, 'message': 'OTP has expired'}), 400

        # Find user and update password
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        # Hash and update password
        user.password = generate_password_hash(new_password)

        # Delete OTP after use
        db.session.delete(otp_obj)
        db.session.commit()

        # Send confirmation email
        try:
            msg = Message(
                subject="✅ Password Reset Successful - Water Quality Analyzer",
                recipients=[email],
                html=f"""
                <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f9ff; padding: 20px; border-radius: 10px;">
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #27ae60, #2ecc71); border-radius: 10px; color: white;">
                        <h2 style="margin: 0; font-size: 28px;">✅ Password Reset Successful!</h2>
                        <p style="margin-top: 8px; font-size: 16px;">Your password has been updated</p>
                    </div>

                    <div style="padding: 20px; background: #ffffff; border-radius: 10px; margin-top: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.06);">
                        <p style="font-size: 15px; color: #333; line-height: 1.6;">
                            Your password has been successfully reset! 🎉<br><br>
                            You can now log in with your new password.
                        </p>
                    </div>

                    <div style="text-align:center; margin-top:15px; color: #888; font-size: 13px;">
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p>Secure & Protected 🛡️<br><strong>Water Quality Analyzer Team</strong></p>
                    </div>
                </div>
                """
            )
            mail.send(msg)
        except Exception:
            current_app.logger.exception(
                "Password was reset, but the confirmation email could not be sent"
            )

        return jsonify({'success': True, 'message': 'Password reset successfully. Please log in with your new password.'}), 200

    except Exception:
        db.session.rollback()
        current_app.logger.exception("Password reset failed")
        return jsonify({'success': False, 'message': 'Server error'}), 500
