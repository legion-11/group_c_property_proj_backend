const {getDB} = require("../config/database");

const db = getDB();
const userCollectionName = "user";
const userCollection = db.collection(userCollectionName);

const findByEmail = (username) => {
    return userCollection
        .findOne({ email: username })
};

const findUserById = (id) => {
    return userCollection
        .findOne({ _id: id })
};

const findByUserIdAndUpdate = (id, update= {}) => {
  return userCollection.findOneAndUpdate({ _id: id }, update)
};


const insertUser = (user, options = {}) => {
    return userCollection
        .insertOne(user, options)
};



module.exports = {findByEmail, findByUserId: findUserById, insertUser, findByUserIdAndUpdate};