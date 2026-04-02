import fhe_mock as ts
import ecdsa
import hashlib

class ConfidentialRiskAssessor:
    """
    Python Backend Server for Midnight ZK-Judge
    This class performs Artificial Intelligence scoring strictly in the Encrypted FHE Space.
    """
    def __init__(self):
        print("[AI Server] Initializing Model and Generating Zero-Knowledge Signature Keys...")
        # Generate the server's ECDSA Signing parameters for the mathematical "Commitment" over the calculation
        self.sk = ecdsa.SigningKey.generate(curve=ecdsa.SECP256k1)
        self.vk = self.sk.get_verifying_key()
        
        # Public AI Model Weights matching the ZK contract conceptually
        # [Credit_weight, Income_weight, Debt_weight]
        self.public_weights = [5.0, 3.0, -4.0]
        print(f"[AI Server] Active Model Weights: {self.public_weights}")

    def evaluate(self, encrypted_vector_bytes, context_bytes):
        print("\n[AI Server API] Received Request. Incoming Data Type: Encrypted Ciphertext")
        
        # 1. Reconstruct the user's FHE Context explicitly without any Private Key.
        context = ts.context_from(context_bytes)
        
        # 2. Load the encrypted vector into the TenSEAL format
        enc_pii_vector = ts.ckks_vector_from(context, encrypted_vector_bytes)
        
        print(f"[AI Server API] Performing 'Blind' Inference Evaluation...")
        # 3. SECURE INFERENCE: Tensor dot product over ciphertexts ! 
        # The AI doesn't know the inputs, nor the output it just generated!
        enc_risk_score = enc_pii_vector.dot(self.public_weights)
        
        # 4. Serialize the obfuscated result
        out_bytes = enc_risk_score.serialize()
        
        # 5. Create a Cryptographic Signature (Commitment)
        # This proves to the Midnight Contract that THIS model evaluated THIS inputs to THIS output.
        h_in = hashlib.sha256(encrypted_vector_bytes).digest()
        h_out = hashlib.sha256(out_bytes).digest()
        payload = h_in + h_out
        
        signature = self.sk.sign(payload)
        print("[AI Server API] Generated Valid Cryptographic Signature over inference.")
        
        return {
            "cipher_out": out_bytes,
            "signature": signature,
            "ai_pub_key": self.vk.to_string().hex()
        }
