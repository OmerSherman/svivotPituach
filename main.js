require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT;

app.use(express.json());

const logger = require('./middleware/logger');
app.use(logger);

const cities_router = require('./routes/cities_r');
const favorites_router = require('./routes/favorites_r');
const profiles_router = require('./routes/profile_r');
const attractions_router = require('./routes/attractions_r');
const users_router = require('./routes/users_r');

app.use('/api/profile', profiles_router);
app.use('/api/cities', cities_router);
app.use('/api/favorites', favorites_router);
app.use('/api/attractions', attractions_router);
app.use('/api/users', users_router);

// centralized error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
