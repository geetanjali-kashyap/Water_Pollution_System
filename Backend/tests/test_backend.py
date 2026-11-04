from pathlib import Path
import sys
import unittest
from unittest.mock import patch

from sqlalchemy.exc import IntegrityError


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


def setUpModule():
    global create_app, db, User, OTP, prediction_route
    from extensions import db
    with patch("dotenv.load_dotenv"), patch("extensions.db.create_all"):
        from app import create_app
    from models.otp import OTP
    from models.user import User
    from routes import prediction_route


class BackendApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app(
            {
                "TESTING": True,
                "SECRET_KEY": "backend-test-secret",
                "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
                "SQLALCHEMY_TRACK_MODIFICATIONS": False,
                "MAIL_SUPPRESS_SEND": True,
                "MAIL_USERNAME": "test@example.com",
                "MAIL_PASSWORD": "test-password",
                "MAIL_DEFAULT_SENDER": "test@example.com",
            }
        )
        cls.client = cls.app.test_client()

    @classmethod
    def tearDownClass(cls):
        with cls.app.app_context():
            db.session.remove()
            db.engine.dispose()

    def setUp(self):
        with self.app.app_context():
            db.drop_all()
            db.create_all()

    def register_user(self, email="user@example.com", password="Password123"):
        with patch("routes.auth_route.mail.send"):
            return self.client.post(
                "/api/auth/register",
                json={
                    "name": "Test User",
                    "email": email,
                    "password": password,
                    "confirm_password": password,
                },
            )

    def test_auth_template_posts_to_registered_api_routes(self):
        page = self.client.get("/api/auth/")
        self.assertEqual(page.status_code, 200)
        self.assertIn(b'action="/api/auth/login"', page.data)
        self.assertIn(b'action="/api/auth/register"', page.data)

        with patch("routes.auth_route.mail.send"):
            registration = self.client.post(
                "/api/auth/register",
                data={
                    "name": "Form User",
                    "email": "form@example.com",
                    "password": "Password123",
                    "confirm_password": "Password123",
                },
            )
        self.assertEqual(registration.status_code, 201)

    def test_smtp_diagnostics_route_uses_configured_server(self):
        class FakeSMTP:
            def ehlo(self):
                return None

            def starttls(self):
                return None

            def login(self, email, password):
                self.credentials = (email, password)

            def quit(self):
                return None

        smtp = FakeSMTP()
        with patch("routes.auth_route.smtplib.SMTP", return_value=smtp):
            response = self.client.get("/api/auth/smtp-test")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()["ok"])
        self.assertEqual(
            smtp.credentials, ("test@example.com", "test-password")
        )

    def test_registration_login_and_token_validation(self):
        response = self.register_user()
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.get_json()["success"])

        with self.app.app_context():
            user = User.query.filter_by(email="user@example.com").one()
            self.assertNotEqual(user.password, "Password123")

        login = self.client.post(
            "/api/auth/login",
            json={"email": "user@example.com", "password": "Password123"},
        )
        self.assertEqual(login.status_code, 200)
        token = login.get_json()["token"]

        validation = self.client.post(
            "/api/auth/validate-token", json={"token": token}
        )
        self.assertEqual(validation.status_code, 200)
        self.assertTrue(validation.get_json()["valid"])

        invalid_login = self.client.post(
            "/api/auth/login",
            json={"email": "user@example.com", "password": "wrong-password"},
        )
        self.assertEqual(invalid_login.status_code, 401)

        invalid_token = self.client.post(
            "/api/auth/validate-token", json={"token": "invalid-token"}
        )
        self.assertEqual(invalid_token.status_code, 401)

        duplicate = self.register_user()
        self.assertEqual(duplicate.status_code, 409)

    def test_login_returns_json_server_error_on_unexpected_failure(self):
        self.register_user()
        with patch(
            "routes.auth_route.check_password_hash",
            side_effect=RuntimeError("hash backend unavailable"),
        ):
            response = self.client.post(
                "/api/auth/login",
                json={"email": "user@example.com", "password": "Password123"},
            )

        self.assertEqual(response.status_code, 500)
        self.assertFalse(response.get_json()["success"])

    def test_registration_reports_database_errors_as_server_errors(self):
        with patch(
            "routes.auth_route.db.session.commit",
            side_effect=RuntimeError("database unavailable"),
        ):
            response = self.register_user()

        self.assertEqual(response.status_code, 500)
        self.assertFalse(response.get_json()["success"])

    def test_registration_returns_conflict_for_database_integrity_error(self):
        error = IntegrityError(
            "INSERT INTO user (...) VALUES (...)", {}, Exception("duplicate key")
        )
        with patch(
            "routes.auth_route.db.session.commit",
            side_effect=error,
        ):
            response = self.register_user()

        self.assertEqual(response.status_code, 409)
        self.assertIn("Email already registered", response.get_json()["message"])

    def test_auth_endpoints_reject_non_object_json_without_server_errors(self):
        cases = (
            ("/api/auth/register", 400),
            ("/api/auth/login", 400),
            ("/api/auth/validate-token", 401),
            ("/api/auth/forgot-password", 400),
            ("/api/auth/verify-otp", 400),
            ("/api/auth/reset-password", 400),
        )
        for endpoint, expected_status in cases:
            with self.subTest(endpoint=endpoint):
                response = self.client.post(endpoint, json=["invalid", "shape"])
                self.assertEqual(response.status_code, expected_status)

    def test_auth_endpoints_reject_wrong_field_types(self):
        requests = (
            (
                "/api/auth/register",
                {
                    "name": ["not", "text"],
                    "email": "user@example.com",
                    "password": "Password123",
                    "confirm_password": "Password123",
                },
            ),
            ("/api/auth/login", {"email": ["not", "text"], "password": "x"}),
            ("/api/auth/forgot-password", {"email": 12}),
            (
                "/api/auth/verify-otp",
                {"email": "user@example.com", "otp_code": 123456},
            ),
        )
        for endpoint, payload in requests:
            with self.subTest(endpoint=endpoint):
                response = self.client.post(endpoint, json=payload)
                self.assertEqual(response.status_code, 400)

    def test_forgot_password_otp_verification_and_reset(self):
        self.register_user()

        request_otp = self.client.post(
            "/api/auth/forgot-password", json={"email": "user@example.com"}
        )
        self.assertEqual(request_otp.status_code, 200)

        with self.app.app_context():
            otp = OTP.query.filter_by(email="user@example.com").one()
            otp.otp_code = "012345"
            db.session.commit()

        verify = self.client.post(
            "/api/auth/verify-otp",
            json={"email": "user@example.com", "otp_code": "012345"},
        )
        self.assertEqual(verify.status_code, 200)

        with patch("routes.auth_route.mail.send"):
            wrong_code = self.client.post(
                "/api/auth/reset-password",
                json={
                    "email": "user@example.com",
                    "otp_code": "999999",
                    "new_password": "NewPassword123",
                    "confirm_password": "NewPassword123",
                },
            )
        self.assertEqual(wrong_code.status_code, 400)

        with patch("routes.auth_route.mail.send"):
            reset = self.client.post(
                "/api/auth/reset-password",
                json={
                    "email": "user@example.com",
                    "otp_code": "012345",
                    "new_password": "NewPassword123",
                    "confirm_password": "NewPassword123",
                },
            )
        self.assertEqual(reset.status_code, 200)

        login = self.client.post(
            "/api/auth/login",
            json={"email": "user@example.com", "password": "NewPassword123"},
        )
        self.assertEqual(login.status_code, 200)

    def test_prediction_success_and_rejects_bad_json_or_non_finite_values(self):
        class FakeModel:
            feature_names_in_ = [
                "Temperature", "Dissolved Oxygen", "pH", "Conductivity",
                "BOD", "Nitrate", "Fecal Coliform", "Total Coliform",
            ]

            def predict(self, values):
                return [1] if len(values) == 1 else []

        class FakeEncoder:
            def inverse_transform(self, values):
                return ["Safe" for _ in values]

        payload = {
            "temperature": 22,
            "dissolvedOxygen": 8,
            "ph": 7,
            "conductivity": 120,
            "bod": 2,
            "nitrate": 1,
            "fecalColiform": 10,
            "totalColiform": 20,
        }

        with (
            patch.object(prediction_route, "model", FakeModel()),
            patch.object(prediction_route, "le", FakeEncoder()),
        ):
            for endpoint in ("predict", "tap", "river"):
                with self.subTest(endpoint=endpoint):
                    response = self.client.post(
                        f"/api/prediction/{endpoint}", json=payload
                    )
                    self.assertEqual(response.status_code, 200)
                    self.assertEqual(response.get_json()["prediction"], "Safe")

                    malformed = self.client.post(
                        f"/api/prediction/{endpoint}",
                        data="{",
                        content_type="application/json",
                    )
                    self.assertEqual(malformed.status_code, 400)

                    non_object = self.client.post(
                        f"/api/prediction/{endpoint}", json=["not", "an", "object"]
                    )
                    self.assertEqual(non_object.status_code, 400)

            non_finite = dict(payload, temperature=float("nan"))
            invalid_number = self.client.post(
                "/api/prediction/predict", json=non_finite
            )
            self.assertEqual(invalid_number.status_code, 400)

            non_numeric = dict(payload, temperature=True)
            invalid_type = self.client.post(
                "/api/prediction/predict", json=non_numeric
            )
            self.assertEqual(invalid_type.status_code, 400)

    def test_prediction_diagnostics_route(self):
        response = self.client.get("/api/prediction/diagnostics")
        self.assertEqual(response.status_code, 200)
        self.assertIn("main_model_status", response.get_json())

    def test_tap_prediction_validation_and_success(self):
        class FakeTapModel:
            def predict(self, values):
                return ["Low" for _ in values]

        payload = {
            "ph": 7,
            "Hardness": 100,
            "Chloramines": 2,
            "Sulfate": 50,
            "Turbidity": 1,
        }

        with patch.object(prediction_route, "tap_model", FakeTapModel()):
            response = self.client.post(
                "/api/prediction/tap-status", json=payload
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json()["prediction"], "Low")

            invalid = self.client.post(
                "/api/prediction/tap-status",
                json=dict(payload, Turbidity=float("inf")),
            )
            self.assertEqual(invalid.status_code, 400)

            malformed = self.client.post(
                "/api/prediction/tap-status",
                data="{",
                content_type="application/json",
            )
            self.assertEqual(malformed.status_code, 400)


if __name__ == "__main__":
    unittest.main()
