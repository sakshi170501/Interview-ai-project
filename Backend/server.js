require("dotenv").config()
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app=require("./src/app")
const connectToDB=require("./src/config/database");
const { resume,selfDescription, jobDescription } = require("./src/services/temp");
const {generateInterviewReport}=require("./src/services/ai.service")


connectToDB()
generateInterviewReport({resume,selfDescription,jobDescription})


app.listen(3000,()=>{
    console.log("Server is running on 3000")
})
