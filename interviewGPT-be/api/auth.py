import os
from flask import session, abort, request, jsonify, render_template_string
from functools import wraps
from dotenv import load_dotenv
from itsdangerous import URLSafeTimedSerializer
import jwt
from .models import User

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
EMAIL_PASS = os.getenv("EMAIL_PASS")
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_VERIFY_URI = os.getenv("EMAIL_VERIFY_URI")
FRONTEND_URL = os.getenv("FRONTEND_URL")
TA_USER=os.getenv("TA_USER")

s = URLSafeTimedSerializer(SECRET_KEY)


def login_is_required(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        if "google_id" not in session:
            return abort(401)  # Authorization required
        else:
            return function(*args, **kwargs)
    return wrapper

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing !!'}), 401

        try:
            token = token.replace('Bearer ', '')
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user_id = data['user_id']
            current_user = User.query.filter_by(id=current_user_id).first()
            if not current_user:
                return jsonify({'message': 'User not found !!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired !!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid !!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid !!', 'error': str(e)}), 401
        
        # Pass the current_user to the wrapped function
        return f(current_user, *args, **kwargs)
    
    return decorated

def generate_email_template(title, message, link, button_text):
    html_head = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
      body {{
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }}
      .container {{
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
      }}
      .logo {{
        display: block;
        margin: 20px auto;
        text-align: center;
      }}
      .button-container {{
        text-align: center;
        margin-top: 30px;
      }}
      .verify-button {{
        display: inline-block;
        padding: 10px 20px;
        background-color: #007bff;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 5px;
      }}
      .footer {{
        text-align: center;
        margin-top: 20px;
        font-size: 12px;
        color: #999999;
      }}
      @media (max-width: 480px) {{
        .container {{
          max-width: 90%;
          padding: 10px;
        }}
        .logo {{
          margin: 10px auto;
        }}
      }}
    </style>
    </head>"""

    html_body = f"""
    <body>
    <div class="container">
        <div class="logo">
        <img src="https://www.bluetickconsultants.com/images/bluetick-consultants.png" alt="Company Logo" width="150">
        </div>
        <h2>{title}</h2>
        <p>Dear user,</p>
        <p>{message}</p>
        <div class="button-container">
        <a href="{link}" class="verify-button">{button_text}</a>
        </div>
    </div>
    <div class="footer">
        Bluetick Consultants LLP &bull; Bangalore, India &bull;  <a href="https://www.bluetickconsultants.com">www.bluetickconsultants.com</a>
    </div>
    </body>
    </html>
    """
    return html_head + html_body

def create_reset_password_body(link):
    return generate_email_template(
        "Reset Password",
        "To reset the password, please click the 'Reset Password' button below:",
        link,
        "Reset Password"
    )

def create_verification_email_body(link):
    return generate_email_template(
        "Email Verification",
        "Thank you for registering with InterviewGPT. To complete the registration process, please click the 'Verify Email' button below:",
        link,
        "Verify Email"
    )

def password_reset_form_html(token):
    html_head = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Reset Password</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                margin: 0;
                padding: 0;
                background-color: #f2f2f2;
            }
            .container {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .form-container {
                padding: 50px;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
                width: 400px;
            }
            .heading {
                font-size: 24px;
                color: #333333;
                margin-bottom: 20px;
            }
            .message {
                font-size: 18px;
                color: #555555;
                margin-bottom: 30px;
            }
            .form {
                text-align: left;
            }
            .form-label {
                display: block;
                font-size: 18px;
                color: #333333;
                margin-bottom: 10px;
            }
            .form-input {
                width: 100%;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
                font-size: 16px;
                margin-bottom: 20px;
            }
            .button {
                background-color: #007BFF;
                color: white;
                border: none;
                padding: 12px 24px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 18px;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            .button:hover {
                background-color: #0056b3;
            }
            @media (max-width: 480px) {
                .form-container {
                    width: 90%;
                    padding: 30px;
                }
            }
        </style>
    </head>
    """

    html_body = f"""
    <body>
    <div class="container">
        <div class="form-container">
            <div class="logo">
                <img src="https://www.bluetickconsultants.com/images/bluetick-consultants.png" alt="Company Logo" width="150">
            </div>
            <br/><br/>
            <div class="heading">Reset Your Password</div>
            <div class="message">Please enter your new password below</div>
            <form class="form" method="POST" onsubmit="return validateForm()">
                <label class="form-label" for="new_password">New Password:</label>
                <input class="form-input" type="password" id="new_password" name="new_password" required>
                <label class="form-label" for="confirm_password">Confirm Password:</label>
                <input class="form-input" type="password" id="confirm_password" name="confirm_password" required>
                <input type="hidden" name="token" value="{token}">
                <button class="button" type="submit">Reset Password</button>
            </form>
        </div>
    </div>
    <script>
        function validateForm() {{
            var newPassword = document.getElementById("new_password").value;
            var confirmPassword = document.getElementById("confirm_password").value;

            if (newPassword.length < 8) {{
                alert("Password must be at least 8 characters long.");
                return false;
            }}

            if (newPassword !== confirmPassword) {{
                alert("Passwords do not match. Please make sure both passwords are the same.");
                return false;
            }}

            return true;
        }}
    </script>
    </body>
    </html>  
    """

    return html_head + html_body

def generate_success_html_page(title, heading, message, link, button_text):
    html_head = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{title}</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                text-align: center;
                margin: 0;
                padding: 0;
                background-color: #f2f2f2;
            }}
            .container {{
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }}
            .form-container {{
                padding: 50px;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
                width: 400px;
            }}
            .heading {{
                font-size: 24px;
                color: #333333;
                margin-bottom: 20px;
            }}
            .message {{
                font-size: 18px;
                color: #555555;
                margin-bottom: 30px;
            }}
            .button {{
                background-color: #007BFF;
                color: white;
                border: none;
                padding: 12px 24px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 18px;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }}
            .button:hover {{
                background-color: #0056b3;
            }}
        </style>
    </head>
    """
    html_body = f"""
    <body>
    <div class="container">
        <div class="form-container">
            <div class="logo">
                <img src="https://www.bluetickconsultants.com/images/bluetick-consultants.png" alt="Company Logo" width="150">
            </div>
            <br/><br/>
            <div class="heading">{heading}</div>
            <div class="message">{message}</div>
            <a href="{link}" class="button">{button_text}</a>
        </div>
    </div>
    </body>
    </html>  
    """
    return html_head + html_body

def password_reset_success_html(link):
    return generate_success_html_page(
        "Password Reset Successful", "Password Reset Successful",
        "Your password has been successfully reset. You can now log in using your new password.",
        link, "Log In"
    )

def email_verified_success_html(link):
    return generate_success_html_page(
        "Email Confirmed", "Email Successfully Verified",
        "Thank you for verifying your email. You're now ready to start using InterviewGPT.",
        link, "Log In and Get Started"
    )

def create_assessment_email_body(candidate_name, link):
    return f"""
    <html>
    <body>
        <p>Dear {candidate_name},</p>
        <p>Congratulations! You have been approved to move forward to the next stage of our selection process. We are excited to invite you to participate in an online assessment designed to evaluate your skills and qualifications for the position.</p>

        <h4>Assessment Details:</h4>
        <ul>
            <li><strong>Assessment Type:</strong> [Specify the type of assessment, e.g., technical, behavioral, coding]</li>
            <li><strong>Duration:</strong> [Specify the duration of the assessment, e.g., 1 hour, 2 hours]</li>
            <li><strong>Link:</strong> <a href="{link}">Take Your Test</a></li>
        </ul>

        <p>To begin your assessment, please click "Take Your Test" above.</p>

        <h4>Important Information:</h4>
        <ul>
            <li><strong>Link Expiry:</strong> The assessment link will expire in 2 hours from the time of this email. Please ensure to complete the assessment within this timeframe.</li>
            <li><strong>Preparation:</strong> Ensure you have a stable internet connection and a quiet environment to complete the assessment without interruptions.</li>
            <li><strong>Support:</strong> If you encounter any issues or have any questions, please do not hesitate to reach out to us at [support email/phone number].</li>
        </ul>

        <h4>What to Expect:</h4>
        <ul>
            <li><strong>Technical Questions:</strong> You will be asked to solve problems related to the technical skills required for the role.</li>
            <li><strong>Behavioral Questions:</strong> We will assess your fit with our company culture and your problem-solving approach.</li>
            <li><strong>Coding Challenges:</strong> You may be required to write code to solve specific problems.</li>
        </ul>

        <p>This assessment is a crucial part of our selection process, allowing us to understand your skills and how you approach problems. It provides you with an opportunity to showcase your abilities and stand out as a top candidate for the position.</p>

        <p>Thank you for your interest in joining Bluetick Consultants. We look forward to your participation and wish you the best of luck.</p>

        <p>Best regards,<br>BLUETICK CONSULTANTS</p>
    </body>
    </html>
    """
