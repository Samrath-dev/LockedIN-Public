const express = require('express');
const router  = express.Router();
const Session = require('../models/session');

// Helper to validate http(s) URLs
function isHttpUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

router.post('/', async (req, res, next) => {
  const { url, startTime, endTime, duration } = req.body;

  // 1) Required fields
  if (!url || !startTime || !endTime) {
    return res.status(400).json({ error: 'url, startTime and endTime are required.' });
  }

  // 2) URL format
  if (!isHttpUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL.' });
  }

  // 3) duration must be a non‐negative number if provided
  if (duration != null && (typeof duration !== 'number' || duration < 0)) {
    return res.status(400).json({ error: 'Invalid duration.' });
  }

  try {
    const session = new Session(req.body);
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const sessions = await Session.find().sort({ startTime: -1 });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

module.exports = router;