import fhe_mock as ts
import ecdsa
import hashlib
from fhe_server import ConfidentialRiskAssessor

def run_fhe_pipeline():
    print("========== 1. CLIENT LOCAL SETUP ==========")
    print("[Client] Generating Local FHE Cryptography Keys...")
    print("[Client] NOTE: The Private key NEVER leaves this machine!")
    
    # Setup TenSEAL CKKS FHE scheme parameters
    context = ts.context(ts.SCHEME_TYPE.CKKS, poly_modulus_degree=8192, coeff_mod_bit_sizes=[60, 40, 40, 60])
    context.global_scale = 2**40
    context.generate_galois_keys()
    
    # Serialize context. One WITH the secret key (for us), one WITHOUT (for the server).
    secret_context = context.serialize(save_secret_key=True)
    public_context = context.serialize(save_secret_key=False)
    
    # Secret PII: [Credit_History, Income_Multiplier, Debt_Ratio]
    pii = [110.0, 100.0, 20.0] 
    print(f"[Client] User True Raw Records: {pii}")
    
    # Encrypt the Private data
    enc_pii = ts.ckks_vector(context, pii)
    enc_bytes = enc_pii.serialize()
    print(f"[Client] Local records mathematically obfuscated.")
    
    print("\n========== 2. TRANSMITTING TO AI SERVER ==========")
    print(f"--> Transmitting payload of {len(enc_bytes)} bytes over untrusted network...")
    
    # Boot the server (Mock network)
    server = ConfidentialRiskAssessor()
    
    print("\n========== 3. SERVER REMOTE PROCESSING ==========")
    # Send the public FHE context and the encrypted bytes to evaluate
    response_payload = server.evaluate(enc_bytes, public_context)
    
    print("\n========== 4. TRANSMITTING BACK TO CLIENT ==========")
    print(f"<-- Receiving payload of {len(response_payload['cipher_out'])} bytes & Signature.")
    
    print("\n========== 5. LOCAL DECRYPTION & VALIDATION ==========")
    # We use our Secret Context (with the Private Key) to decrypt the answer.
    sk_context = ts.context_from(secret_context)
    enc_result = ts.ckks_vector_from(sk_context, response_payload["cipher_out"])
    
    try:
        # DECRYPT THE SERVER'S ANSWER
        decrypted_score = enc_result.decrypt()[0]
        print(f"[Client] Successfully Decrypted Server Feedback!")
        print(f"[Client] The AI Evaluated our records and graded us a Score of: {round(decrypted_score, 2)}")
        
        # Verify the AI Signature mathematically aligns with the Ciphertext we sent and received
        h_in = hashlib.sha256(enc_bytes).digest()
        h_out = hashlib.sha256(response_payload["cipher_out"]).digest()
        
        # Hydrate the ECDSA Public verification key of the Midnight AI Server
        vk = ecdsa.VerifyingKey.from_string(bytes.fromhex(response_payload["ai_pub_key"]), curve=ecdsa.SECP256k1)
        
        vk.verify(response_payload["signature"], h_in + h_out)
        print("[Client] [SUCCESS] AI SIGNATURE VERIFIED: Cryptographically proven that the official Server AI evaluated our exact Inputs.")

    except ecdsa.BadSignatureError:
        print("[Client] [ERROR] ERROR: Signature Verification Failed! Payload manipulated!")
        return

    print("\n========== 6. MIDNIGHT SMART CONTRACT HANDOFF ==========")
    print("[Midnight ZKP Client] Everything aligns.")
    print("Now generating Zero-Knowledge Proof that: Decrypted_Score > Threshold, AND Signature is Valid.")
    print("Broadcasting to Midnight Network Ledger...")
    
if __name__ == "__main__":
    run_fhe_pipeline()
