require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'http://localhost:3001'
}));

app.use(express.json());
const port = process.env.PORT;

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

app.use(logger);

// routers
const cities_router = require('./routes/cities_r');
const favorites_router = require('./routes/favorites_r');
const profiles_router = require('./routes/profiles_r');
const attractions_router = require('./routes/attractions_r');
const users_router = require('./routes/users_r');
const auth_router = require('./routes/auth_r');
const settings_router = require('./routes/settings_r');

app.use('/api/profile', profiles_router);
app.use('/api/cities', cities_router);
app.use('/api/favorites', favorites_router);
app.use('/api/attractions', attractions_router);
app.use('/api/users', users_router);
app.use('/api/auth', auth_router);
app.use('/api/settings', settings_router);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
