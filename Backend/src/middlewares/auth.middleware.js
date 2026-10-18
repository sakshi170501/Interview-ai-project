const jwt = require("jsonwebtoken");
const tokenBlacklistModel=require("../models/blacklist.model")

async function authUser(req, res, next) {

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "token not provided"
        });
    }
    const isTokenblacklisted=await tokenBlacklistModel.findOne({
        token
    })
    if(isTokenblacklisted){
        return res.status(401).json({
            message:"Token is invalid"
        })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    } catch (err) {

        return res.status(401).json({
            message: "Invalid token"
        });
    }
}

module.exports = { authUser };