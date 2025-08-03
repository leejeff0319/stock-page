import os
from dotenv import load_dotenv
from plaid.api import plaid_api
from plaid.model import *
from plaid import Configuration

load_dotenv()

PLAID_ENV_MAPPING = {
    'sandbox': 'https://sandbox.plaid.com',
    'development': 'https://development.plaid.com',
    'production': 'https://production.plaid.com'
}

PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
PLAID_SECRET = os.getenv("PLAID_SECRET")
PLAID_ENV = os.getenv("PLAID_ENV", "sandbox")

if not PLAID_CLIENT_ID or not PLAID_SECRET:
    raise ValueError("Plaid credentials not configured")

configuration = Configuration(
    host=PLAID_ENV_MAPPING[PLAID_ENV],
    api_key={
        'clientId': PLAID_CLIENT_ID,
        'secret': PLAID_SECRET,
    }
)

client = plaid_api.PlaidApi(plaid.ApiClient(configuration))