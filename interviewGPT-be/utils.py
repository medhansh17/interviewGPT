import os
from flask import session, abort
from dotenv import load_dotenv
from functools import wraps
from flask import request, jsonify
import jwt
# from api import User

SECRET_KEY = "THIISISTHESECRETKEY"
load_dotenv()


def login_is_required(function):
    def wrapper(*args, **kwargs):
        if "google_id" not in session:
            return abort(401)  # Authorization required
        else:
            return function()

    return wrapper


OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
#UPLOAD_PATH = os.environ["UPLOAD_PATH"]
#REDIRECT_URI = os.environ["REDIRECT_URI"]
#NURSING_CARE_LANCEDB_PATH = os.environ["NURSING_CARE_LANCEDB_PATH"]
#DISCHARGED_LANCEDB_PATH = os.environ["DISCHARGED_LANCEDB_PATH"]
EMAIL_PASS = os.environ["EMAIL_PASS"]
EMAIL_USER = os.environ["EMAIL_USER"]
EMAIL_VERIFY_URI = os.environ["EMAIL_VERIFY_URI"]
FRONTEND_URL = os.environ["FRONTEND_URL"]
OAUTHLIB_INSECURE_TRANSPORT = "1"



# decorator for verifying the JWT

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # jwt is passed in the request header
        token = request.headers.get('Authorization')

        # return 401 if token is not passed
        if not token:
            return jsonify({'message': 'Token is missing !!'}), 401

        try:
            # decoding the payload to fetch the stored details
            token = token.replace('Bearer ', '')
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = data['user_id']

            # Pass 'current_user' as an argument to the decorated function
            return f(current_user, *args, **kwargs)

        except Exception as e:
            return jsonify({
                'message': 'Token is invalid !!'
            }), 401

    return decorated


"""
Module for utility functions related to user login.
"""


def generate_email_template(title, message, link, button_text):
    """
    Generates a generic email template with dynamic content.

    Args:
        title (str): Title of the email.
        message (str): Main message of the email.
        link (str): URL link for the button.
        button_text (str): Text for the button.

    Returns:
        str: The HTML content for the email template.
    """
    html_head = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
    /* Your CSS styles here */
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
        /* Media query for mobile devices */
      @media (max-width: 480px) {{
        .container {{
          max-width: 90%; /* Adjust as needed */
          padding: 10px;
        }}
        .logo {{
          margin: 10px auto;
        }}
        /* Adjust other styles for mobile */
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
    """
    Generates the HTML content for the password reset form.

    Args:
        token (str): The reset token.

    Returns:
        str: The HTML content for the password reset form.
    """
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
        /* Media query for mobile devices */
        @media (max-width: 480px) {
            .form-container {
                width: 90%; /* Adjust as needed */
                padding: 30px;
            }
            /* Adjust other styles for mobile */
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
    """
    Generates the HTML content for a success page.

    Args:
        title (str): Title of the page.
        heading (str): Heading for the page.
        message (str): Main message of the page.
        link (str): URL link for the button.
        button_text (str): Text for the button.

    Returns:
        str: The HTML content for the generic page.
    """
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
    """
    Generates the HTML content for the password reset success page.

    Args:
        link (str): The URL to the login page.

    Returns:
        str: The HTML content for the password reset success page.
    """
    return generate_success_html_page(
        "Password Reset Successful", "Password Reset Successful",
        "Your password has been successfully reset. You can now log in using your new password.",
        link, "Log In"
    )


def email_verified_success_html(link):
    """
    Generates the HTML content for the email verification success page.

    Args:
        link (str): The URL to the login page.

    Returns:
        str: The HTML content for the email verification success page.
    """
    return generate_success_html_page(
        "Email Confirmed", "Email Successfully Verified",
        "Thank you for verifying your email. You're now ready to start using BluetickPDF.",
        link, "Log In and Get Started"
    )