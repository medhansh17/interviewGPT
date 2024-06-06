from flask import Blueprint, request, jsonify, render_template_string
from flask_mail import Message
from datetime import datetime, timedelta
import jwt
from api.auth import (token_required, s, create_reset_password_body, 
                      create_verification_email_body, password_reset_form_html, 
                      password_reset_success_html, email_verified_success_html, 
                      SECRET_KEY, EMAIL_PASS, EMAIL_USER, EMAIL_VERIFY_URI, FRONTEND_URL)
from api.models import User
from api import db

login_bp = Blueprint('login', __name__)

@login_bp.route('/forgot_password', methods=['POST'])
def forgot_password():
    from api import mail
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Please enter an email'}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'There is no account with that email. You must register first.'}), 400

    if not user.email_confirmed:
        return jsonify({"error": "Please verify your account first."})

    token = s.dumps(email, salt='password-reset-link')
    confirm_route = 'reset'
    link = f'{EMAIL_VERIFY_URI}/{confirm_route}/{token}'

    html_content = create_reset_password_body(link)
    msg = Message('reset password', sender=EMAIL_USER,
                  recipients=[email], html=html_content)
    mail.send(msg)

    return jsonify({'success': 'The Password reset link is sent on your mail.'})

@login_bp.route('/reset/<token>', methods=['GET', 'POST'])
def reset(token):
    from api import bcrypt
    if request.method == 'GET':
        try:
            email = s.loads(token, salt='password-reset-link', max_age=1800)
            user = User.query.filter_by(email=email).first()
            if user:
                html_content = password_reset_form_html(token)
                return render_template_string(html_content)
            else:
                return "User not found."
        except Exception:
            return "Link expired or invalid."
    elif request.method == 'POST':
        token = request.form.get('token')
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')
        try:
            email = s.loads(token, salt='password-reset-link', max_age=1800)
            user = User.query.filter_by(email=email).first()
            if user:
                if new_password == confirm_password:
                    user.password = bcrypt.generate_password_hash(new_password)
                    user.reset_token = None
                    db.session.commit()
                    login_url = FRONTEND_URL
                    html_content = password_reset_success_html(login_url)
                    return render_template_string(html_content)
                else:
                    return "Passwords do not match."
            else:
                return "User not found."
        except Exception:
            return "Link expired or invalid."

@login_bp.route('/login', methods=['POST'])
def login():
    from api import bcrypt
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Invalid credentials.'}), 400

    if not user.email_confirmed:
        return jsonify({'error': 'Please confirm your email before logging in.'}), 401

    if not bcrypt.check_password_hash(user.password, password.encode('utf-8')):
        return jsonify({'error': 'Invalid credentials. Incorrect password.'}), 401

    user.last_login = datetime.now()
    db.session.commit()

    token_payload = {
        'email': email,
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(weeks=1)
    }
    token = jwt.encode(token_payload, SECRET_KEY, algorithm='HS256')

    return jsonify({'token': token, 'user_id': user.id, "first_name": user.first_name, "last_name": user.last_name}), 200

@login_bp.route('/register', methods=['POST'])
def register():
    from api import bcrypt, mail
    data = request.get_json()
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400
    existing_user_email = User.query.filter_by(email=email).first()
    if existing_user_email:
        return jsonify({'error': 'Email already exists.'}), 401
    else:
        try:
            hashed_password = bcrypt.generate_password_hash(password.encode('utf-8'))
            new_user = User(email=email, password=hashed_password,
                            first_name=first_name, last_name=last_name)

            token = s.dumps(email, salt='email-confirmation-link')
            confirm_route = 'confirm'
            link = f'{EMAIL_VERIFY_URI}/{confirm_route}/{token}'

            html_content = create_verification_email_body(link)
            msg = Message('verification', sender=EMAIL_USER,
                          recipients=[email], html=html_content)

            mail.send(msg)
            db.session.add(new_user)
            db.session.commit()

            return jsonify({"message": "created user successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 401

@login_bp.route('/confirm/<token>')
def confirm(token):
    try:
        email = s.loads(token, salt='email-confirmation-link', max_age=180000)
        user = User.query.filter_by(email=email).first()
        if user:
            user.email_confirmed = True
            user.email_confirmed_on = datetime.now()
            db.session.commit()
            html_content = email_verified_success_html(FRONTEND_URL)
            return render_template_string(html_content)
        else:
            return "User not found."
    except Exception as e:
        return str(e)
