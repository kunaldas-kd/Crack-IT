import smtplib
import os
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ─── Config (read from environment variables) ─────────────────────────
EMAIL_HOST     = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT     = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USER     = os.environ.get('EMAIL_USER', '')      # your Gmail address
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD', '')  # App Password (not Gmail password)
EMAIL_FROM     = os.environ.get('EMAIL_FROM', EMAIL_USER)

def send_email(to_email: str, subject: str, body_html: str, body_text: Optional[str] = None) -> bool:
    """
    Sends an HTML email via SMTP (TLS).

    Args:
        to_email  (str): Recipient email address.
        subject   (str): Email subject line.
        body_html (str): HTML body of the email.
        body_text (str): Plain-text fallback (optional).

    Returns:
        bool: True if sent successfully, False otherwise.
    """
    if not EMAIL_USER or not EMAIL_PASSWORD:
        # Avoid crashing when email is not configured during development
        print(f"[!] Email skipped. Credentials missing. Would have sent to {to_email}")
        return False

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From']    = f"Crack-IT Platform <{EMAIL_FROM}>"
    msg['To']      = to_email

    if body_text:
        msg.attach(MIMEText(body_text, 'plain'))

    msg.attach(MIMEText(body_html, 'html'))

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_FROM, to_email, msg.as_string())
        print(f"[✓] Email sent to {to_email}")
        return True
    except smtplib.SMTPAuthenticationError:
        print("[✗] SMTP Authentication failed. Check EMAIL_USER / EMAIL_PASSWORD.")
        return False
    except smtplib.SMTPException as e:
        print(f"[✗] SMTP error: {e}")
        return False
    except Exception as e:
        print(f"[✗] Unexpected error: {e}")
        return False

# ─── Pre-built Email Templates ────────────────────────────────────────

def send_otp_email(to_email: str, otp_code: str, user_name: str = 'User') -> bool:
    """Sends a branded OTP verification email."""
    subject   = "Your Crack-IT Verification Code"
    body_html = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;background:#EEF4FB;border-radius:12px;">
      <div style="background:linear-gradient(135deg,#1B4E8C,#5B7FA6);padding:20px 32px;border-radius:10px 10px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:-0.5px;">Crack-<span style='color:#2ECC8B;'>IT</span></h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:12px;">B2B Education Platform</p>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 10px 10px;border:1px solid #dbeafe;border-top:none;">
        <p style="color:#0f172a;font-size:16px;">Hi <strong>{user_name}</strong>,</p>
        <p style="color:#475569;font-size:14px;line-height:1.6;">
          Use the verification code below to complete your action. This code expires in <strong>5 minutes</strong>.
        </p>
        <div style="background:#EFF6FF;border:2px dashed #93C5FD;border-radius:10px;padding:20px;text-align:center;margin:24px 0;">
          <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#1D4ED8;">{otp_code}</span>
        </div>
        <p style="color:#94a3b8;font-size:12px;text-align:center;">
          If you did not request this code, please ignore this email.
        </p>
      </div>
    </div>
    """
    body_text = f"Hi {user_name}, your Crack-IT OTP is: {otp_code}. Valid for 5 minutes."
    return send_email(to_email, subject, body_html, body_text)

def send_welcome_email(to_email: str, user_name: str, temp_password: Optional[str] = None) -> bool:
    """Sends a welcome email to a newly registered user or student."""
    subject   = f"Welcome to Crack-IT, {user_name}!"
    pwd_block = ""
    if temp_password:
        pwd_block = f"""
        <div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="color:#059669;font-size:13px;margin:0;font-weight:600;">Your Temporary Password</p>
          <p style="font-size:18px;font-weight:800;letter-spacing:2px;color:#065F46;margin:8px 0 0;">{temp_password}</p>
          <p style="color:#6B7280;font-size:11px;margin:6px 0 0;">Please change this on your first login.</p>
        </div>
        """
    body_html = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;background:#F0F5FF;border-radius:12px;">
      <div style="background:linear-gradient(135deg,#1B4E8C,#2ECC8B);padding:24px 32px;border-radius:10px 10px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Welcome to Crack-IT 🎉</h1>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 10px 10px;border:1px solid #dbeafe;border-top:none;">
        <p style="color:#0f172a;font-size:16px;">Hi <strong>{user_name}</strong>,</p>
        <p style="color:#475569;font-size:14px;line-height:1.7;">
          Your account has been successfully created on the <strong>Crack-IT</strong> platform. 
          You now have access to manage your institute, batches, and students.
        </p>
        {pwd_block}
        <a href="http://localhost:5173/login" 
           style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin-top:8px;">
          Access Platform →
        </a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
          Questions? Reply to this email or reach us at support@crackit.in
        </p>
      </div>
    </div>
    """
    body_text = f"Welcome to Crack-IT, {user_name}! Log in at http://localhost:5173/login"
    return send_email(to_email, subject, body_html, body_text)

def send_password_reset_email(to_email: str, user_name: str, reset_token: str) -> bool:
    """Sends a password reset link email."""
    reset_url = f"http://localhost:5173/reset-password?token={reset_token}"
    subject   = "Reset Your Crack-IT Password"
    body_html = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;background:#F0F5FF;border-radius:12px;">
      <div style="background:#DC2626;padding:20px 32px;border-radius:10px 10px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:20px;">Password Reset Request</h1>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 10px 10px;border:1px solid #fee2e2;border-top:none;">
        <p style="color:#0f172a;font-size:15px;">Hi <strong>{user_name}</strong>,</p>
        <p style="color:#475569;font-size:14px;line-height:1.6;">
          We received a request to reset your Crack-IT password. Click the button below — 
          this link expires in <strong>30 minutes</strong>.
        </p>
        <a href="{reset_url}" 
           style="display:inline-block;background:#DC2626;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:20px 0;">
          Reset Password
        </a>
        <p style="color:#94a3b8;font-size:12px;word-break:break-all;">
          Or copy this link: {reset_url}
        </p>
        <p style="color:#94a3b8;font-size:12px;margin-top:16px;">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
    </div>
    """
    body_text = f"Hi {user_name}, reset your Crack-IT password here: {reset_url}"
    return send_email(to_email, subject, body_html, body_text)

def send_credentials_email(to_email: str, user_name: str, uid: str, password: str, role: str = "User") -> bool:
    """Sends login credentials to a newly created user."""
    subject   = f"Your Crack-IT {role} Credentials"
    body_html = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;background:#F0F5FF;border-radius:12px;">
      <div style="background:linear-gradient(135deg,#1B4E8C,#2ECC8B);padding:24px 32px;border-radius:10px 10px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Your Login Credentials 🔐</h1>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 10px 10px;border:1px solid #dbeafe;border-top:none;">
        <p style="color:#0f172a;font-size:16px;">Hi <strong>{user_name}</strong>,</p>
        <p style="color:#475569;font-size:14px;line-height:1.7;">
          An account has been created for you on the <strong>Crack-IT</strong> platform. 
          Please use the following credentials to access your account:
        </p>
        
        <div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="color:#059669;font-size:13px;margin:0;font-weight:600;">User ID</p>
          <p style="font-size:16px;font-weight:700;color:#065F46;margin:4px 0 12px;">{uid}</p>
          
          <p style="color:#059669;font-size:13px;margin:0;font-weight:600;">Password</p>
          <p style="font-size:16px;font-weight:700;color:#065F46;margin:4px 0 0;">{password}</p>
        </div>
        
        <p style="color:#DC2626;font-size:12px;font-weight:600;margin-top:8px;">
          ⚠️ For security reasons, we strongly recommend changing your password after your first login.
        </p>

        <a href="http://localhost:5173/login" 
           style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin-top:16px;">
          Log In Now →
        </a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
          Questions? Reply to this email or reach us at support@crackit.in
        </p>
      </div>
    </div>
    """
    body_text = f"Hi {user_name},\n\nYour Crack-IT login credentials:\nUser ID: {uid}\nPassword: {password}\n\nLog in at http://localhost:5173/login"
    return send_email(to_email, subject, body_html, body_text)
