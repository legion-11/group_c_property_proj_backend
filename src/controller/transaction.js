const {hashObject} = require("../lib/passwordUtils");

const {getLastTransaction, insertTransaction, getTransactionsCount} = require("../model/transaction")

const types = {
    create: 1,
    sell: 2,
    buy: 3,
    setForRent: 4,
    rent: 5,
}

let count = null;

const getCount = async () => {
    if (count == null) {
        try {
            count = await getTransactionsCount()
        }catch (e) {
            throw e
        }
    }
}

const getLastTransactionHash = async () => {
    const lastDoc = await getLastTransaction()
    try {
        return  lastDoc.hash
    } catch (e) {
        return Array(65).join("0")
    }
}

const basicTransaction = async (type, ownerId, propertyId) => {
    console.log("type " + type)
    await getCount()
    const previousHash = await getLastTransactionHash()
    count++
    return {
        type: type,
        ownerId: ownerId,
        propertyId: propertyId,
        nonce: count,
        previousHash: previousHash,
    }
}

const getTransactionCreatedObj = async (ownerId, propertyId) => {
    const transactionObject = await basicTransaction(types.create, ownerId, propertyId)
    transactionObject.hash = hashObject(transactionObject)
    return transactionObject
}

const addTransactionCreated = async (ownerId, propertyId) => {
    try{
        const trx = await getTransactionCreatedObj(ownerId, propertyId)
        console.log(trx)
        return insertTransaction(trx)
    }catch (e) {
        count--
        console.error("addTransactionCreated: "+e.message)
    }
}

//
// const getTransactionForSellingObj = async (ownerId, propertyId, previousHash, price) => {
//     try {
//         const transactionObject = basicTransaction(Type.create, ownerId, propertyId, previousHash)
//         transactionObject.price = price
//         transactionObject.hash = hashObject(transactionObject)
//
//         return transactionObject
//     }catch (e) {
//         console.error(e.message)
//     }
// }

module.exports = {addTransactionCreated};