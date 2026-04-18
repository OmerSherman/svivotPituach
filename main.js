require('dotenv').config();
const express = require('express')
const app = express()
app.use(express.json())
const port = 3000

//import routers
const auth_router = require('./routes/auth_r')
const cities_router =  require('./routes/cities_r')
const favorites_router = require('./routes/favorites_r')
const profiles_router = require('./routes/profile_r')
const recommendations_router = require('./routes/recommendations_r')

//define routers
app.use('/api/auth' , auth_router)
app.use('api/profile' , profiles_router)
app.use('/api/cities', cities_router)
app.use('/api/favorites' , favorites_router)
app.use('/api/recommendations' , recommendations_router)