// load environment variables from .env file
require('dotenv').config();
const express = require('express')
const app = express()
app.use(express.json())
const port = 3000

// import middlewares
const logger = require('./middleware/logger');
const roleCheck = require('./middleware/roleCheck')

// parse incoming JSON request bodies automatically
app.use(logger);

// import routers
const auth_router = require('./routes/auth_r')
const cities_router =  require('./routes/cities_r')
const favorites_router = require('./routes/favorites_r')
const profiles_router = require('./routes/profile_r')
const attractions_router = require('./routes/attractions_r')

// define routers
app.use('/api/auth' , auth_router)
app.use('/api/profile' , profiles_router)
app.use('/api/cities', cities_router)
app.use('/api/favorites' , favorites_router)
app.use('/api/recommendations' , attractions_router)

// start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});