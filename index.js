const express = require('express');
require("./src/database/Connection")();
const dotenv = require("dotenv");
const cors = require("cors");
const userRouter = require('./src/routes/UserRouter');
const { upadateNotificationInUserCollection, addFriendInUserCollection, getLoginUserData, userLogout } = require('./src/utils/SocketController');

// socket io
const socket = require("socket.io");

dotenv.config()

// app
const app = express()

// middleware
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.static('public'))


// routes
app.use('/api', userRouter)


const Port = process.env.PORT || 9000

// server connection
const server = app.listen(Port, () => {
    console.log(`Server is Running at Port No ${Port}`)
})


const io = socket(server, {
    cors: { origin: true }
})

let allOnlineUser = {}

io.on("connection", (socket) => {
    // console.log(`someone connected ${socket.id}`);
    // console.log(allOnlineUser);

    socket.on("disconnect", () => {
        // console.log(`${socket.id} offline`);

        for (var key in allOnlineUser) {
            if (allOnlineUser[key] === socket.id) {
                delete allOnlineUser[key]
                break
            }
        }
    })

    socket.on("online_user", async (userId) => {
        // console.log(`${socket.id} online`);
        allOnlineUser[userId] = socket.id

        const onlineUser = await getLoginUserData(userId)
        io.to(allOnlineUser[userId]).emit("user_online", onlineUser)

        onlineUser.friends.forEach(async (friend) => {
            if (friend.online) {
                const onlineUser = await getLoginUserData(friend._id)
                io.to(allOnlineUser[friend._id]).emit("user_online", onlineUser)
            }
        })
    })

    socket.on("offline_user", async (userId) => {
        const offlineUser = await userLogout(userId)
        // console.log(offlineUser);

        offlineUser.friends.forEach(async (friend) => {
            if (friend.online) {
                const onlineUser = await getLoginUserData(friend._id)
                io.to(allOnlineUser[friend._id]).emit("user_online", onlineUser)
            }
        })
    })

    socket.on("friend_request_send", async (request) => {
        const updatedUser = await upadateNotificationInUserCollection(request, '$push')

        io.to(allOnlineUser[request.receiverId]).emit('friend_request_receive', updatedUser)
    })

    socket.on("accept_friend_request", async (bothIds) => {
        const updatedUser = await addFriendInUserCollection(bothIds)

        // emit event and add friend in the friend list of sender person (who send the friend request)
        io.to(allOnlineUser[bothIds.senderId]).emit("request_accepted", updatedUser.sender)

        // emit event and add friend in the friend list of receiver person (who accept the friend request)
        io.to(allOnlineUser[bothIds.receiverId]).emit("you_accept_request", updatedUser.receiver)
    })

    socket.on("reject_friend_request", async (request) => {
        const updatedUser = await upadateNotificationInUserCollection(request, '$pull')

        io.to(allOnlineUser[request.receiverId]).emit('friend_request_receive', updatedUser)
    })
})