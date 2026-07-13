const { Router } = require('express');
const Collection = require('../models/Collection');
const { authenticate } = require('../middleware/auth');

const router = Router();

// Get user's collections
router.get('/', authenticate, async (req, res) => {
  try {
    const collections = await Collection.getUserCollections(req.user.id);
    res.json({ success: true, collections });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get collections' });
  }
});

// Create collection
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Collection name required' });

    const collectionId = await Collection.create(req.user.id, name, description, color);
    res.json({ success: true, collectionId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Get collection items
router.get('/:id/items', authenticate, async (req, res) => {
  try {
    const items = await Collection.getCollectionItems(req.params.id);
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get collection items' });
  }
});

// Add item to collection
router.post('/:id/items', authenticate, async (req, res) => {
  try {
    const { analysisId } = req.body;
    if (!analysisId) return res.status(400).json({ error: 'Analysis ID required' });

    await Collection.addItem(req.params.id, analysisId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Remove item from collection
router.delete('/:id/items/:analysisId', authenticate, async (req, res) => {
  try {
    await Collection.removeItem(req.params.id, req.params.analysisId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// Update collection
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    await Collection.updateCollection(req.params.id, name, description, color);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

// Delete collection
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Collection.deleteCollection(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

module.exports = router;
