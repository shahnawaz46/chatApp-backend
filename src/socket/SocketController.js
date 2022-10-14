const UserCollection = require("../models/UserCollection")
const MessageCollection = require("../models/MessageCollection")


exports.getLoginUserData = async (userId) => {
    try {
        let loginUser = await UserCollection.findById(userId).select('name image friends number about notifications online').populate('friends', 'name image number about online')

        if (loginUser.online)
            return loginUser

        loginUser.online = true
        await loginUser.save()

        // console.log("else", loginUser.online);
        return loginUser

    } catch (err) {
        console.log(err)
    }
}


exports.userLogout = async (userId) => {
    try {
        const logoutUser = await UserCollection.findByIdAndUpdate(userId, { $set: { online: false } }).select('friends').populate('friends', 'name image number about online')
        return logoutUser

    } catch (err) {
        console.log(err)
    }
}

exports.upadateNotificationInUserCollection = async (request, operation) => {
    try {
        // console.log(operation);
        const user = await UserCollection.findByIdAndUpdate(request.receiverId, {
            [operation]: { 'notifications': { userId: request.senderId, message: request.message } }
        }, { new: true }).select('name image friends number about notifications online').populate('friends', 'name image number about online')

        // console.log(user);
        return user

    } catch (error) {
        console.log(error)
    }
}


exports.addFriendInUserCollection = async (bothIds) => {
    try {

        // $addToSet : it will only push data to the array if data is not present in the array 
        // note : it will not work on object of array
        const sender = await UserCollection.findByIdAndUpdate(bothIds.senderId, {
            $addToSet: { 'friends': bothIds.receiverId }
        }, { new: true }).select('name image friends number about notifications online').populate('friends', 'name image number about online')

        let receiver = await UserCollection.findByIdAndUpdate(bothIds.receiverId,
            { $addToSet: { 'friends': bothIds.senderId } },
            { new: true })

        receiver = await UserCollection.findByIdAndUpdate(bothIds.receiverId, {
            $pull: { 'notifications': { userId: bothIds.senderId } }
        }, { new: true }).select('name image friends number about notifications online').populate('friends', 'name image number about online')

        // console.log(sender, receiver);
        return { sender, receiver }

    } catch (error) {
        console.log(error)
    }
}

exports.removeFriendFromUserCollection = async ({ loginId, removerId }) => {
    try {
        const sender = await UserCollection.findByIdAndUpdate(loginId, { $pull: { 'friends': removerId } },
            { new: true }).select('name image friends number about notifications online').populate('friends', 'name image number about online')

        const remover = await UserCollection.findByIdAndUpdate(removerId, { $pull: { 'friends': loginId } },
            { new: true }).select('name image friends number about notifications online').populate('friends', 'name image number about online')

        return { sender, remover }

    } catch (error) {
        console.log(error);
    }
}

exports.addMessagesToTheDatabase = async (key, messageDetail) => {
    try {
        const { senderId, receiverId } = messageDetail
        const isMessageAvailable = await MessageCollection.findOne({ key })

        if (isMessageAvailable)
            await MessageCollection.findOneAndUpdate({ key }, { $push: { "messages": messageDetail } })

        else
            await MessageCollection.create({ user1: senderId, user2: receiverId, key, 'messages': messageDetail, })

    } catch (error) {
        console.log(error);
    }
}

exports.getMessagesfromTheDatabase = async (_id) => {
    try {
        const messages = await MessageCollection.find({ $or: [{ user1: _id }, { user2: _id }] }).select("key messages")

        const messageObj = {}
        messages.forEach((msg) => messageObj[msg.key] = msg.messages)

        return messageObj

    } catch (error) {
        console.log(error)
    }
}

exports.removeMessageFromTheDatabase = async (key) => {
    try {
        await MessageCollection.findOneAndDelete({ key })

    } catch (error) {
        console.log(error)
    }
}

exports.allMessagesSeen = async (key) => {
    try {
        await MessageCollection.findOneAndUpdate({ key }, { $set: { 'messages.$[].receiverSeen': true } })

    } catch (error) {
        console.log(error)
    }
}

exports.deleteSingleMessageFromDatabase = async (messageId, key) => {
    try {
        const messages = await MessageCollection.findOneAndUpdate({ key }, { $pull: { "messages": { messageId } } }, { new: true }).select("messages")
        return messages

    } catch (error) {
        console.log(error)
    }
}