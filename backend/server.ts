import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { semanticCacheService } from './services/semanticCacheService';
import { geocodingService } from './services/geocodingService';
import { ollamaService } from './services/ollamaService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Geocode address to coordinates
app.post('/api/geocode', async (req: Request, res: Response) => {
  try {
    const { address } = req.body;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Address is required' });
    }

    const result = await semanticCacheService.geocodeWithCache(address);

    if (!result) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reverse geocode coordinates to address
app.post('/api/reverse-geocode', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'Valid latitude and longitude are required' });
    }

    const result = await semanticCacheService.reverseGeocodeWithCache(lat, lng);

    if (!result) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Autocomplete address suggestions
app.get('/api/autocomplete', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`🔍 Autocomplete request for: "${query}"`);
    const results = await geocodingService.autocomplete(query);
    console.log(`✅ Found ${results.length} suggestions`);
    res.json(results);
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cache statistics
app.get('/api/cache/stats', (req: Request, res: Response) => {
  const stats = semanticCacheService.getStats();
  res.json(stats);
});

// Clear cache
app.post('/api/cache/clear', (req: Request, res: Response) => {
  semanticCacheService.clear();
  res.json({ message: 'Cache cleared successfully' });
});

// Start server
async function startServer() {
  try {
    // Initialize Ollama service
    console.log('Checking Ollama availability...');
    const ollamaAvailable = await ollamaService.isAvailable();
    
    if (ollamaAvailable) {
      console.log('Ollama is available. Ensuring model is ready...');
      await ollamaService.ensureModel();
    } else {
      console.warn('Ollama is not available. Using fallback embeddings.');
      console.warn('For better semantic matching, install Ollama and run: ollama pull nomic-embed-text');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
      console.log(`📊 Cache stats: http://localhost:${PORT}/api/cache/stats`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
