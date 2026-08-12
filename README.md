# Midnight-ZK-Judge ⚖️🛡️

This project is a prototype built for the Midnight Network.

**Privacy-Preserving Decision Circuit**

## 🚀 Live Demo

- 🌐 **Live App:** [Click here to try the Live Demo](https://midnight-zk-judge.vercel.app/)
*(Note: The live demo currently features a simulated UI that mocks the zero-knowledge proof generation and network submission flow to demonstrate the conceptual UX).*

## Demo Video

https://github.com/user-attachments/assets/1e809760-7bfc-4f63-ad39-f441f12387e7



Midnight-ZK-Judge is an architectural blueprint for a **Privacy-Preserving Decision Circuit**. It enables decentralized entities to evaluate sensitive user data (financial, medical, or proprietary records), render a deterministic decision, and cryptographically verify the integrity of that decision on the **Midnight Network**—without exposing Personally Identifiable Information (PII) to the public ledger.

---

## 🛑 The Problem: Data Privacy Leaks

When users submit data for critical evaluation—such as credit risk assessments—they surrender control of their sensitive information. Conversely, publishing raw records to a blockchain to verify a decision compromises user privacy. We need a mechanism that proves data was evaluated fairly against established rules *without* leaking the underlying inputs.

## 🔑 The Solution: "Proof of Fair Decision" via Confidential Computation

Midnight-ZK-Judge leverages the **Midnight Network's** specialized Zero-Knowledge (ZK) architecture. By shifting the computational burden to local clients operating Zero-Knowledge provers, we generate a mathematical **Proof of Fair Decision**.

The smart contract acts as an immutable arbiter. It verifies the cryptographic proof of the execution against a strict, predefined public threshold. The on-chain state reflects only the verified outcome (e.g., Approved/Rejected).

## ⚙️ How It Works (Conceptual Prototype)

This repository contains a conceptual prototype for a multi-phase execution strategy:

1. **Private Ingestion:** Sensitive records are localized as *Private Witness Data* outside the purview of the public chain.
2. **Proving (The Circuit):** 
   - A ZK-SNARK `circuit` structured in Midnight's `Compact` language enforces a simple linear threshold scoring logic mathematically. 
   - The user passes their private signals to the circuit locally.
   - The circuit computes whether the score surpasses the public threshold, compiling the result into a zero-knowledge proof.
3. **On-Chain Verification:** The Midnight node validators verify the generated proof payload. If valid, the smart contract updates its state to represent the Boolean verdict.

*Disclaimer: The repository currently provides simple linear threshold Compact circuits (`contracts/`) and a simulated frontend that mocks the proof generation and submission flow. Any previous references to advanced AI models or Fully Homomorphic Encryption (FHE) have been removed, as the code demonstrates a simpler deterministic threshold logic.*

## 🛠 Tech Stack

- **React + Vite + Tailwind CSS:** A modern UI architecture for the simulated proof flow.
- **Midnight SDK & Compact:** The specialized cryptographic programming language for the threshold circuits.

## 📝 Compiling the Compact Contracts

The `.compact` files in the `contracts/` directory can be compiled using the Midnight Compact compiler.
You can compile them using the `compactc` CLI (ensure you have a compatible Compact compiler version as defined by `pragma language_version >= 0.14.0` in the files):
```bash
compactc contracts/credit_score.compact
compactc contracts/zk_judge.compact
```
