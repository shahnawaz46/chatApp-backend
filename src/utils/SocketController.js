const UserCollection = require("../models/UserCollection")

exports.upadateNotificationInUserCollection = async (request, operation) => {
    try {
        // console.log(operation);
        const user = await UserCollection.findByIdAndUpdate(request.receiverId, {
            [operation]: { 'notifications': { userId: request.senderId, message: request.message } }
        }, { new: true }).select('name image friends number about notifications').populate('friends', 'name image number about')

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
        }, { new: true }).select('name image friends number about notifications').populate('friends', 'name image number about')

        let receiver = await UserCollection.findByIdAndUpdate(bothIds.receiverId,
            { $addToSet: { 'friends': bothIds.senderId } },
            { new: true })

        receiver = await UserCollection.findByIdAndUpdate(bothIds.receiverId, {
            $pull: { 'notifications': { userId: bothIds.senderId } }
        }, { new: true }).select('name image friends number about notifications').populate('friends', 'name image number about')


        // console.log(sender, receiver);
        return { sender, receiver }

    } catch (error) {
        console.log(error)
    }
}