import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export class OllamaService {
  private modelName = 'nomic-embed-text';

  /**
   * Generate embedding for a text using Ollama
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        `${OLLAMA_URL}/api/embeddings`,
        {
          model: this.modelName,
          prompt: text,
        },
        {
          timeout: 10000,
        }
      );

      if (response.data && response.data.embedding) {
        return response.data.embedding;
      }

      throw new Error('Invalid response from Ollama');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          console.warn('Ollama not available, using fallback hash-based embedding');
          return this.fallbackEmbedding(text);
        }
      }
      console.error('Error generating embedding:', error);
      return this.fallbackEmbedding(text);
    }
  }

  /**
   * Fallback: Generate simple hash-based embedding when Ollama is unavailable
   * This is not as accurate but allows the system to work without Ollama
   */
  private fallbackEmbedding(text: string): number[] {
    const normalized = text.toLowerCase().trim();
    const embedding = new Array(384).fill(0); // nomic-embed-text uses 768, using 384 for simplicity

    // Simple hash-based embedding
    for (let i = 0; i < normalized.length; i++) {
      const charCode = normalized.charCodeAt(i);
      const index = (charCode * (i + 1)) % embedding.length;
      embedding[index] += charCode / 1000;
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map((val) => (magnitude > 0 ? val / magnitude : 0));
  }

  /**
   * Check if Ollama is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${OLLAMA_URL}/api/tags`, {
        timeout: 3000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Ensure the required model is available
   */
  async ensureModel(): Promise<void> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        console.warn('Ollama is not running. Using fallback embeddings.');
        return;
      }

      const response = await axios.get(`${OLLAMA_URL}/api/tags`);
      const models = response.data.models || [];
      const hasModel = models.some((m: any) => m.name.includes(this.modelName));

      if (!hasModel) {
        console.log(`Model ${this.modelName} not found. Pulling...`);
        await axios.post(`${OLLAMA_URL}/api/pull`, {
          name: this.modelName,
        });
        console.log(`Model ${this.modelName} pulled successfully`);
      }
    } catch (error) {
      console.warn('Could not verify Ollama model, using fallback embeddings');
    }
  }
}

export const ollamaService = new OllamaService();
