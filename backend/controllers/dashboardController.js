const postModel = require('../models/postModel');

async function getStats(req, res, next) {
  try {
    const stats = await postModel.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
