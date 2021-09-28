const {getDB} = require("../config/database");

const db = getDB();
const transactionCollectionName = "transaction";
const transactionCollection = db.collection(transactionCollectionName);

const findByTransactionsByOwnerId = (id) => {
    return transactionCollection
        .find({ ownerId: id }).toArray()
};

const findByTransactionsByPropertyId = (id) => {
    return transactionCollection
        .find({ propertyId: id }).toArray()
};

const findTransactions = () => {
    return transactionCollection
        .find().toArray()
};

const findBTransactionId = (id) => {
    return transactionCollection
        .findOne({ _id: id })
};

const insertTransaction = (trx) => {
    return transactionCollection
        .insertOne(trx)
};

const getLastTransaction = () => {
    return transactionCollection.findOne(
        {},
        { sort: { _id: -1 } }
    )
};

module.exports = {getLastTransaction, insertTransaction};