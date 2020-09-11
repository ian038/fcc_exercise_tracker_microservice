const express = require('express')
const app = express()
require('dotenv').config()

const cors = require('cors')

const mongoose = require('mongoose')
// Connect to mongoose
const uri = process.env.MONGO_URI
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Opened')
})

app.use(cors())

app.use(express.urlencoded({extended: false}))
app.use(express.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const { createUser, addExercise, getLog, getAllUsers } = require('./controller')

app.post('/api/exercise/new-user', createUser)
app.post('/api/exercise/add', addExercise)
app.get('/api/exercise/log', getLog)
app.get('/api/exercise/users', getAllUsers)

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
