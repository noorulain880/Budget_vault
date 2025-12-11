// backend/routes/transactionRoutes.js
const express = require('express');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { authRequired } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/transactions
// Optional query: ?type=income/expense&from=2025-01-01&to=2025-01-31
router.get('/', authRequired, async (req, res) => {
  try {
    const { type, from, to } = req.query;
    const filter = { userId: req.user.userId };

    if (type) filter.type = type;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const txns = await Transaction.find(filter)
      .sort({ date: -1 })
      .populate('categoryId', 'name type');

    res.json(txns);
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ message: 'Failed to fetch transactions', error: err.message });
  }
});

// POST /api/transactions
router.post('/', authRequired, async (req, res) => {
  try {
    const { type, amount, categoryId, categoryName, date, description } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ message: 'Type and amount are required' });
    }

    let categoryDoc = null;
    if (categoryId) {
      categoryDoc = await Category.findOne({
        _id: categoryId,
        userId: req.user.userId,
      });
    }

    const txn = await Transaction.create({
      userId: req.user.userId,
      type,
      amount,
      categoryId: categoryDoc ? categoryDoc._id : undefined,
      categoryName: categoryDoc ? categoryDoc.name : categoryName || '',
      date: date ? new Date(date) : new Date(),
      description: description || '',
    });

    res.status(201).json(txn);
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ message: 'Failed to create transaction', error: err.message });
  }
});

// PUT /api/transactions/:id
router.put('/:id', authRequired, async (req, res) => {
  try {
    const { type, amount, categoryId, categoryName, date, description } = req.body;

    const update = {
      type,
      amount,
      categoryId: categoryId || undefined,
      categoryName: categoryName || '',
      date: date ? new Date(date) : new Date(),
      description: description || '',
    };

    const txn = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      update,
      { new: true }
    );

    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    res.json(txn);
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ message: 'Failed to update transaction', error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!deleted) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ message: 'Failed to delete transaction', error: err.message });
  }
});

module.exports = router;
