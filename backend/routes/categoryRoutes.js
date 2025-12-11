// backend/routes/categoryRoutes.js
const express = require('express');
const Category = require('../models/Category');
const { authRequired } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/categories
router.get('/', authRequired, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
});

// POST /api/categories
router.post('/', authRequired, async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const cat = await Category.create({
      userId: req.user.userId,
      name,
      type: type || 'expense',
    });

    res.status(201).json(cat);
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ message: 'Failed to create category', error: err.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', authRequired, async (req, res) => {
  try {
    const { name, type } = req.body;
    const updated = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, type },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Category not found' });
    res.json(updated);
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ message: 'Failed to update category', error: err.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!deleted) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ message: 'Failed to delete category', error: err.message });
  }
});

module.exports = router;
