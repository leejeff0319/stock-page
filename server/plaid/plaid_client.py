import os
from dotenv import load_dotenv
from plaid.api import plaid_api
from plaid.model import *
from plaid.configuration import Configuration
from fastapi import HTTPException

load_dotenv()

PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
PLAID_SECRET = os.getenv("PLAID_SECRET")
PLAID_ENV = os.getenv("PLAID_ENV", "sandbox") 

configuration = Configuration(
    host=PLAID_ENV,  # Maps to Plaid's API host
    api_key={
        "clientId": PLAID_CLIENT_ID,
        "secret": PLAID_SECRET,
    }
)

client = plaid_api.PlaidApi(plaid.ApiClient(configuration))