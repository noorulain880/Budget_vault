// backend/routes/budgetRoutes.js
const express = require('express');
const Budget = require('../models/Budget');
const { authRequired } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/budgets?month=..&year=..
router.get('/', authRequired, async (req, res) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!month || !year) {
      return res.status(400).json({ message: 'month and year are required' });
    }

    const budget = await Budget.findOne({
      userId: req.user.userId,
      month,
      year,
    });

    res.json(budget || null);
  } catch (err) {
    console.error('Get budget error:', err);
    res.status(500).json({ message: 'Failed to fetch budget', error: err.message });
  }
});

// POST /api/budgets (create or update)
router.post('/', authRequired, async (req, res) => {
  try {
    const { month, year, overallLimit } = req.body;

    if (!month || !year || overallLimit == null) {
      return res
        .status(400)
        .json({ message: 'month, year, and overallLimit are required' });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user.userId, month, year },
      { overallLimit },
      { new: true, upsert: true }
    );

    res.status(201).json(budget);
  } catch (err) {
    console.error('Save budget error:', err);
    res.status(500).json({ message: 'Failed to save budget', error: err.message });
  }
});

module.exports = router;
