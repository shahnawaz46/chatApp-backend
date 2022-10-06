const {
  upadateNotificationInUserCollection,
  addFriendInUserCollection,
  getLoginUserData,
  userLogout,
  addMessagesToTheDatabase,
  getMessagesfromTheDatabase,
  removeFriendFromUserCollection,
  removeMessageFromTheDatabase,
  allMessagesSeen,
} = require("./SocketController");


const checkUserGoOfflineOrRefreshThePage = (id,io) => {

  setTimeout(async () => {
    for (let key in allOnlineUser) {
      if (allOnlineUser[key] === id) {
        console.log("user go offline");

        const offlineUser = await userLogout(key);

        offlineUser?.friends.forEach(async (friend) => {
          if (friend.online) {
            const onlineUser = await getLoginUserData(friend._id);
            io.to(allOnlineUser[friend._id]).emit("user_online", onlineUser);
          }
        });
        break;
      }
    }

  }, 3000)
}

let allOnlineUser = {};

const socketConnection = (io) => {

  io.on("connection", (socket) => {

    socket.on("disconnect", async () => {

      checkUserGoOfflineOrRefreshThePage(socket.id, io)
    });

    socket.on("online_user", async (userId) => {
      allOnlineUser[userId] = socket.id;

      const onlineUser = await getLoginUserData(userId);
      io.to(allOnlineUser[userId]).emit("user_online", onlineUser);

      onlineUser?.friends.forEach(async (friend) => {
        if (friend.online) {
          const onlineUser = await getLoginUserData(friend._id);
          io.to(allOnlineUser[friend._id]).emit("user_online", onlineUser);
        }
      });
    });

    socket.on("logout_user", async (userId) => {
      console.log("logout event");
      const offlineUser = await userLogout(userId);

      offlineUser?.friends.forEach(async (friend) => {
        if (friend.online) {
          const onlineUser = await getLoginUserData(friend._id);
          io.to(allOnlineUser[friend._id]).emit("user_online", onlineUser);
        }
      });
    });

    socket.on("friend_request_send", async (request) => {
      const updatedUser = await upadateNotificationInUserCollection(request, "$push");

      io.to(allOnlineUser[request.receiverId]).emit("friend_request_receive", updatedUser);
    });

    socket.on("accept_friend_request", async (bothIds) => {
      const updatedUser = await addFriendInUserCollection(bothIds);

      // emit event and add friend in the friend list of sender person (who send the friend request)
      io.to(allOnlineUser[bothIds.senderId]).emit("request_accepted", updatedUser.sender);

      // emit event and add friend in the friend list of receiver person (who accept the friend request)
      io.to(allOnlineUser[bothIds.receiverId]).emit("you_accept_request", updatedUser.receiver);
    });

    socket.on("reject_friend_request", async (request) => {
      const updatedUser = await upadateNotificationInUserCollection(request, "$pull");

      io.to(allOnlineUser[request.receiverId]).emit("friend_request_receive", updatedUser);
    });

    socket.on("remove_friend", async (bothIds) => {
      const updatedUser = await removeFriendFromUserCollection(bothIds);

      const key = [bothIds.loginId, bothIds.removerId].sort().join("-");

      io.to(allOnlineUser[bothIds.loginId]).emit("friend_remove", { updatedUser: updatedUser.sender, key });

      io.to(allOnlineUser[bothIds.removerId]).emit("friend_remove", { updatedUser: updatedUser.remover, key });

      await removeMessageFromTheDatabase(key);
    });

    // messages start from here
    socket.on("send_message", async (messageDetail) => {
      const key = [messageDetail.senderId, messageDetail.receiverId].sort().join("-");

      if (allOnlineUser[messageDetail.receiverId])
        io.to(allOnlineUser[messageDetail.receiverId]).emit("receive_message", messageDetail);

      else {
        io.to(allOnlineUser[messageDetail.senderId]).emit("when_receiver_offline", { key, messageDetail });
        await addMessagesToTheDatabase(key, messageDetail);
      }
    });

    socket.on("store_message", async (messageDetail) => {
      const key = [messageDetail.senderId, messageDetail.receiverId].sort().join("-");

      io.to(allOnlineUser[messageDetail.senderId]).to(allOnlineUser[messageDetail.receiverId]).emit("store_message_in_client", { key, messageDetail });

      await addMessagesToTheDatabase(key, messageDetail);
    });

    socket.on("retrieve_message", async (_id) => {
      const messagesObj = await getMessagesfromTheDatabase(_id);

      Object.keys(messagesObj).length > 0 && io.to(allOnlineUser[_id]).emit("retrieve_message_client", { messagesObj });
    });

    socket.on("messages_seen", async ({ key, messages }) => {
      const [id_1, id_2] = key.split("-");

      io.to(allOnlineUser[id_1]).to(allOnlineUser[id_2]).emit("message_seen_client", { key, messages });

      await allMessagesSeen(key);
    });
  });
};

module.exports = socketConnection;
