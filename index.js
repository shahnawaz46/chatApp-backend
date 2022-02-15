const express = require('express');
require("./src/database/Connection")();
const dotenv = require("dotenv");
const UserCollection = require("./src/models/UserCollection");
const cors = require("cors");
const userRouter = require('./src/router/UserRouter');

dotenv.config()

// app
const app = express()

// middleware
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

const Port = process.env.PORT || 9000

// server connection
const server = app.listen(Port, () => {
    console.log(`Server is Running at Port No ${Port}`)
})


// socket connection
const io = require("socket.io")(server, {
    maxHttpBufferSize: 1e9,
    pingTimeout: 60000,
    cors: {
        origin: true
    }
}
)

let allOnlineUsers = []

io.on("connection", (socket) => {
    console.log(`${socket.id} just Connected`)

    socket.on("disconnect", () => {
        console.log(`${socket.id} just Disconnected`)

        // const index = allUsers.findIndex((value) => value.id === socket.id)

        // allUsers.splice(index, 1)
        // io.emit("all_connected_users", allUsers)
    })

    socket.on("user_login", async (_id) => {
        try {
            console.log(_id)
            const user = await UserCollection.findByIdAndUpdate(_id, { socketId: socket.id }, { new: true })

            const doc = user._doc
            delete doc.password

            allOnlineUsers = [
                ...allOnlineUsers,
                doc
            ]

            // console.log("new user", allOnlineUsers)
            io.emit("all_connected_users", allOnlineUsers)

        } catch (error) {
            console.log(error)
        }
    })


    socket.on("user_logout", async (_id) => {
        try {
            await UserCollection.findByIdAndUpdate(_id, { socketId: null })

            allOnlineUsers = allOnlineUsers.filter((value) => value._id != _id)

            // console.log("new user", allOnlineUsers)
            io.emit("all_connected_users", allOnlineUsers)

        } catch (error) {
            console.log(error)
        }

    })

    socket.on("upload_image", async (_id) => {
        try {
            const user = await UserCollection.findById(_id)

            // let onlineUsers = []
            for (let storeUser of allOnlineUsers) {

                if (storeUser._id == _id) {
                    storeUser.image = user.image
                    break;
                }

            }

            // console.log("all online users", allOnlineUsers)
            io.emit("all_connected_users", allOnlineUsers)

        } catch (error) {
            console.log(error)
        }
    })

    socket.on("all_online_users", async (_id = null) => {
        try {
            const allUser = await UserCollection.find({})
            if (!allUser) {
                return res.status(404).json({ error: "No User Found" })
            }

            let onlineUsers = []
            for (let user of allUser) {

                if (user.socketId && user._id == _id) {

                    const updatedUser = await UserCollection.findByIdAndUpdate(user._id, { socketId: socket.id }, { new: true })

                    const doc = updatedUser._doc
                    delete doc.password

                    onlineUsers.push(doc)
                }

                else if (user.socketId) {

                    const doc = user._doc
                    delete doc.password

                    onlineUsers.push(doc)
                }
            }

            allOnlineUsers = onlineUsers
            // console.log("all online users", allOnlineUsers)
            io.emit("all_connected_users", allOnlineUsers)

        } catch (error) {
            console.log(error)
        }
    })

    socket.on("send_message", (data) => {
        // console.log("message send", data)
        const user = allOnlineUsers.find((value) => value.name === data.receiverName)
        // console.log(user)
        user && io.to(user.socketId).emit("new_message", data)
    })
})


app.use('/api', userRouter)