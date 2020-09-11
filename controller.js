const User = require('./models/user.models')
const Exercise = require('./models/exercise.models')

// helper functions
function convertDate(date) {
    const utcDate = new Date(date).toUTCString().slice(0, 16).split(" ")
    for(let i = 0; i < utcDate.length; i++) {
        let substr = utcDate[0].substr(0, 3)
        let newDate = substr + " " + utcDate[2] + " " + utcDate[1] + " " + utcDate[3]
        return newDate
    }
}

exports.createUser = (req, res) => {
    const username = req.body.username
    
    const newUser = new User({ username })
    newUser.save()
           .then(user => {
               res.json({
                   username: user.username,
                   _id: user._id
               })
           })
           .catch(err => {
               return res.status(400).json('Username already taken')
           })
}

exports.addExercise = (req, res) => {
    const userId = req.body.userId
    const description = req.body.description
    const duration = Number(req.body.duration)
    let date = req.body.date

    if(date === '') {
        date = Date.now()
    } else {
        date = Date.parse(date)
    }

    const newExercise = new Exercise({
        userId,
        description,
        duration,
        date
    })

    User.findById(userId).then(user => {
        const username = user.username
        newExercise.save()
                   .then(exercise => {
                       res.json({
                           _id: exercise.userId,
                           username: username,
                           date: convertDate(exercise.date),
                           duration: exercise.duration,
                           description: exercise.description
                        })
                    })
                    .catch(err => {
                        res.status(400).json('Error adding exercise!')
                    })
    }).catch(err => {
        res.status(400).json('User not found!')
    })
}

exports.getLog = (req, res) => {
    let { userId, from, to, limit } = req.query
    const log = []
    User.findById(userId).then(user => {
        if(!user) {
            res.status(400).json('User not found!')
        } else {
            const username = user.username

            if(limit !== undefined) {
                limit = Number(limit)
            }
            Exercise.find({ userId: userId }, (err, exercises) => {
                if(exercises) {
                    for(exercise of exercises) {
                        exercise = exercise.toObject()
                        delete exercise._id
                        delete exercise.userId
                        delete exercise.__v
                        exercise.date = convertDate(exercise.date)
                        log.push(exercise)
                    }
                    const sortedLog = log.sort((a, b) => new Date(a.date) - new Date(b.date))
                    if(from !== undefined) {
                        from = convertDate(from)
                        res.json({
                            _id: userId,
                            username: username,
                            from: from,
                            count: sortedLog.length,
                            log: sortedLog
                        })
                    } else if(to !== undefined) {
                        to = convertDate(to)
                        res.json({
                            _id: userId,
                            username: username,
                            to: to,
                            count: sortedLog.length,
                            log: sortedLog
                        })
                    } else {
                        res.json({
                            _id: userId,
                            username: username,
                            count: sortedLog.length,
                            log: sortedLog
                        })
                    }
                } else if(err) {
                    res.status(400).json('Error finding exercise!')
                }
            })
        }
    }).catch(err => {
        res.status(400).json('User not found!')
    })
}

exports.getAllUsers = (req, res) => {
    User.find()
        .then(users => {
            res.json(users)
        })
        .catch(err => {
            res.status(400).json('Users not found!')
        })
}