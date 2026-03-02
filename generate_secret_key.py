import secrets
import string

def generate_secret_key():
    """Generate a secure Django secret key"""
    chars = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(chars) for _ in range(50))

if __name__ == '__main__':
    secret_key = generate_secret_key()
    print(f"Generated Secret Key:")
    print(f"SECRET_KEY='{secret_key}'")
    print(f"\nAdd this to your Railway environment variables!")
    print(f"Keep this key secure and don't share it!")
