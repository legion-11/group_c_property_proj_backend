const {hashObject} = require("../lib/passwordUtils");

const {getLastTransaction, insertTransaction, getTransactionsCount} = require("../model/transaction")

const types = {
    create: 0,
    setForSell: 1,
    buy: 2,
    setForRent: 3,
    rent: 4,
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

const addTransactionCreated = async (ownerId, propertyId) => {
    try{
        const transactionObject = await basicTransaction(types.create, ownerId, propertyId)
        transactionObject.hash = hashObject(transactionObject)
        console.log(transactionObject)
        return insertTransaction(transactionObject)
    }catch (e) {
        count--
        console.error("addTransactionCreated: "+e.message)
    }
}

const addTransactionSetForSell = async (ownerId, propertyId, price) => {
    try{
        const transactionObject = await basicTransaction(types.setForSell, ownerId, propertyId)
        transactionObject.price = price
        transactionObject.hash = hashObject(transactionObject)
        return insertTransaction(transactionObject)
    }catch (e) {
        count--
        console.error("addTransactionSetForSelling: "+e.message)
    }
}


const addTransactionSetForRent = async (ownerId, propertyId, price, startAt, endAt) => {
    try{
        const transactionObject = await basicTransaction(types.setForRent, ownerId, propertyId)
        transactionObject.price = price
        transactionObject.startAt = startAt
        transactionObject.endAt = endAt
        transactionObject.hash = hashObject(transactionObject)
        return insertTransaction(transactionObject)
    }catch (e) {
        count--
        console.error("addTransactionSetForSelling: "+e.message)
    }
}

const addTransactionRent = async (ownerId, buyerId, propertyId, price, startAt, endAt) => {
    try{
        const transactionObject = await basicTransaction(types.rent, ownerId, propertyId)
        transactionObject.price = price
        transactionObject.startAt = startAt
        transactionObject.endAt = endAt
        transactionObject.buyerId = buyerId
        transactionObject.hash = hashObject(transactionObject)
        return insertTransaction(transactionObject)
    }catch (e) {
        count--
        console.error("addTransactionSetForSelling: "+e.message)
    }
}


module.exports = {addTransactionCreated, addTransactionSetForSell, addTransactionSetForRent, addTransactionRent, types};