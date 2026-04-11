import { type PrivateStateProvider } from '@midnight-ntwrk/midnight-js-types';

export class InMemoryPrivateStateProvider implements PrivateStateProvider {
  private state: Record<string, any> = {};
  private signingKeys: Record<string, any> = {};

  setContractAddress(address: string): void {
    console.log(`[InMemoryPrivateStateProvider] Contract address set to: ${address}`);
  }

  async set(key: string, value: any): Promise<void> {
    this.state[key] = value;
  }

  async get(key: string): Promise<any | null> {
    return this.state[key] ?? null;
  }

  async remove(key: string): Promise<void> {
    delete this.state[key];
  }

  async clear(): Promise<void> {
    this.state = {};
  }

  async setSigningKey(address: string, signingKey: any): Promise<void> {
    this.signingKeys[address] = signingKey;
  }

  async getSigningKey(address: string): Promise<any | null> {
    return this.signingKeys[address] ?? null;
  }

  async removeSigningKey(address: string): Promise<void> {
    delete this.signingKeys[address];
  }

  async clearSigningKeys(): Promise<void> {
    this.signingKeys = {};
  }

  async exportPrivateStates(_options?: any): Promise<any> {
    return {
      format: 'midnight-private-state-export',
      encryptedPayload: '',
      salt: ''
    };
  }

  async importPrivateStates(_exportData: any, _options?: any): Promise<any> {
    return { 
      imported: 0, 
      skipped: 0, 
      overwritten: 0 
    };
  }
}
