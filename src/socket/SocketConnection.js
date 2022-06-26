const { upadateNotificationInUserCollection,
    addFriendInUserCollection,
    getLoginUserData,
    userLogout,
    addMessagesToTheDatabase,
    getMessagesfromTheDatabase } = require('./SocketController');


let allOnlineUser = {}

const socketConnection = (io) => {

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

            onlineUser?.friends.forEach(async (friend) => {
                if (friend.online) {
                    const onlineUser = await getLoginUserData(friend._id)
                    io.to(allOnlineUser[friend._id]).emit("user_online", onlineUser)
                }
            })
        })

        socket.on("offline_user", async (userId) => {
            const offlineUser = await userLogout(userId)
            // console.log(offlineUser);

            offlineUser?.friends.forEach(async (friend) => {
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


        // messages start from here
        socket.on("send_message", async (messageDetail) => {
            // console.log(data.from, data.to, data.message);
            const key = [messageDetail.from, messageDetail.to].sort().join('-')

            // console.log(messages[key]);
            io.to(allOnlineUser[messageDetail.from]).to(allOnlineUser[messageDetail.to]).emit('receive_message', { key, msg: messageDetail })

            await addMessagesToTheDatabase(key, messageDetail)
        })

        socket.on("retrieve_message", async (_id) => {
            const messagesObj = await getMessagesfromTheDatabase(_id)
            // console.log(messages);

            Object.keys(messagesObj).length > 0 && io.to(allOnlineUser[_id]).emit('retrieve_message_client', { messagesObj })
        })
    })
}

module.exports = socketConnection;