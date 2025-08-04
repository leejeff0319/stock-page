import os
from dotenv import load_dotenv
from plaid.api_client import ApiClient
from plaid.configuration import Configuration
from plaid.api import plaid_api
from plaid.model import *

load_dotenv()

class PlaidClient:
    def __init__(self):
        PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
        PLAID_SECRET = os.getenv("PLAID_SECRET")
        PLAID_ENV = os.getenv("PLAID_ENV", "sandbox").lower()

        if not all([PLAID_CLIENT_ID, PLAID_SECRET]):
            raise ValueError("Missing Plaid credentials in environment variables")

        configuration = Configuration(
            host={
                'sandbox': 'https://sandbox.plaid.com',
                'development': 'https://development.plaid.com',
                'production': 'https://production.plaid.com'
            }[PLAID_ENV],
            api_key={
                'clientId': PLAID_CLIENT_ID,
                'secret': PLAID_SECRET
            }
        )

        api_client = ApiClient(configuration)
        self.client = plaid_api.PlaidApi(api_client)

plaid_client = PlaidClient().client