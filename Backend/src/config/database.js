const mongoose = require("mongoose")

let connectionPromise

async function connectToDB() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be configured.")
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection
    }

    if (mongoose.connection.readyState === 0) {
        connectionPromise = null
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI)
            .then((connection) => {
                console.log("Connected to database")
                return connection
            })
            .catch((error) => {
                connectionPromise = null
                throw error
            })
    }

    return connectionPromise
}

module.exports = connectToDB