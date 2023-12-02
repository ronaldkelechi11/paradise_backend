const express = require('express')
const cors = require('cors');
const { mongoose } = require('mongoose')
const app = express()

const PORT = process.env.PORT || 4000
const dbUrl = "mongodb+srv://ronaldkelechi11:ho6dIGViDOU2wisQ@maincluster.q9jui5g.mongodb.net/?retryWrites=true&w=majority"


// Middleware
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("./"))
app.use(cors())

//Getting Routes
const signupRoute = require("./routes/Signup")
const loginRoute = require("./routes/Login")
const dashboardRoute = require("./routes/Dashboard")
const adminRoute = require("./routes/Admin")


// Assigning Routes
app.use("/signup", signupRoute)
app.use("/login", loginRoute)
app.use("/admin", adminRoute)
app.use("/dashboard", dashboardRoute)


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

