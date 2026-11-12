require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const postRoutes = require('./routes/postRoutes');
const publicRoutes = require('./routes/publicRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
