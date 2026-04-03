from fastapi import FastAPI
import cv2
import face_recognition
import os
import uuid
from web3 import Web3
from dotenv import load_dotenv
import json

load_dotenv()
app = FastAPI()

# -----------------------
# BLOCKCHAIN CONFIG
# -----------------------
web3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL")))
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
ACCOUNT = os.getenv("ACCOUNT_ADDRESS")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")

with open("abi.json") as f:
    abi = json.load(f)

contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)

# -----------------------
# TEMP TOKENS
# -----------------------
verified_tokens = {}

# -----------------------
# VERIFY FACE
# -----------------------
@app.get("/verify")
def verify(username: str):

    path = f"voters/{username}.jpg"

    if not os.path.exists(path):
        return {"success": False, "msg": "User not found"}

    known_img = face_recognition.load_image_file(path)
    known_enc = face_recognition.face_encodings(known_img)[0]

    cam = cv2.VideoCapture(0)
    ret, frame = cam.read()
    cam.release()

    if not ret:
        return {"success": False, "msg": "Camera error"}

    rgb = frame[:, :, ::-1]
    encodings = face_recognition.face_encodings(rgb)

    if not encodings:
        return {"success": False, "msg": "No face detected"}

    match = face_recognition.compare_faces([known_enc], encodings[0])[0]

    if match:
        token = str(uuid.uuid4())
        verified_tokens[token] = username
        return {"success": True, "token": token}

    return {"success": False, "msg": "Face mismatch"}

# -----------------------
# CAST VOTE
# -----------------------
@app.post("/vote")
def vote(token: str, candidate_id: int):

    if token not in verified_tokens:
        return {"success": False, "msg": "Invalid token"}

    try:
        nonce = web3.eth.get_transaction_count(ACCOUNT)

        txn = contract.functions.vote(candidate_id).build_transaction({
            "chainId": 1337,
            "gas": 200000,
            "gasPrice": web3.to_wei("10", "gwei"),
            "nonce": nonce,
        })

        signed = web3.eth.account.sign_transaction(txn, PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed.rawTransaction)

        del verified_tokens[token]

        return {"success": True, "tx": tx_hash.hex()}

    except Exception as e:
        return {"success": False, "error": str(e)}