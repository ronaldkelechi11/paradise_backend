const express = require('express')
const cors = require('cors');
const { mongoose } = require('mongoose')
const app = express()

const PORT = process.env.PORT || 4000
const dbUrl = "mongodb+srv://ronaldkelechi11:wKit0n89fCFCtTU5@paradiseinvestment.msdxawb.mongodb.net/?retryWrites=true&w=majority" || process.env.MONGO_URL
// const dbUrl = "mongodb://127.0.0.1:27017/paradiseDB"




// Middleware
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("./"))
app.use(cors())

//Getting Routes
const signupRoute = require("./routes/Signup")
const loginRoute = require("./routes/Login")
const dashboardRoute = require("./routes/UserDashboard")
const adminRoute = require("./routes/AdminDashboard")


// Assigning Routes
app.use("/signup", signupRoute)
app.use("/login", loginRoute)
app.use("/admin", adminRoute)
app.use("/dashboard", dashboardRoute)

// 404 Resource not found
app.get('*', (req, res) => {
    res.status(404).send('404')
})

app.listen(PORT,
    () => {
        console.log(`App listening on port: ${PORT}`)

        mongoose.connect(dbUrl)
            .then((result) => {
                console.log("Succesfully Connected to Mongo DB");
            }).catch((err) => {
                console.log("Error Connecting to Mongo DB: " + err);
            });
    }
)

