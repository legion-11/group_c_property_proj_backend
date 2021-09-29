const {getDB} = require("../config/database");

const db = getDB();
const transactionCollectionName = "transaction";
const transactionCollection = db.collection(transactionCollectionName);

const findTransactionsByOwnerId = (id) => {
    return transactionCollection
        .find({ ownerId: id }).toArray()
};

const findTransactionsByPropertyId = (id) => {
    return transactionCollection
        .find({ propertyId: id }).toArray()
};

const findTransactions = (query={}, options={}) => {
    return transactionCollection
        .find(query, options).toArray()
};

const findTransactionById = (id) => {
    return transactionCollection
        .findOne({ _id: id })
};

const insertTransaction = (trx) => {
    return transactionCollection
        .insertOne(trx)
};

const findLastTransaction = () => {
    return transactionCollection.findOne(
        {},
        { sort: { _id: -1 } }
    )
};

const getTransactionsCount = () => {
    return transactionCollection.count()
}

module.exports = {findLastTransaction, insertTransaction, getTransactionsCount,
    findTransactions, findTransactionsByOwnerId, findTransactionsByPropertyId
};