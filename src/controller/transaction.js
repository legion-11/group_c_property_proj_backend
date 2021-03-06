const {hashObject} = require("../lib/passwordUtils");

const {findLastTransaction, insertTransaction, getTransactionsCount, findTransactionsByOwnerId,
    findTransactionsByPropertyId, findTransactions
} = require("../model/transaction")
const {ObjectId} = require("mongodb");

const types = {
    create: 0,
    setForSell: 1,
    buy: 2,
    setForRent: 3,
    rent: 4,
}

let _count = null;
const getCount = async () => {
    if (_count == null) {
        try {
            _count = await getTransactionsCount()
        }catch (e) {
            throw e
        }
    }
}

const getLastTransactionHash = async () => {
    const lastDoc = await findLastTransaction()
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
    _count++
    return {
        type: type,
        ownerId: ownerId,
        propertyId: propertyId,
        nonce: _count,
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
        _count--
        console.error("addTransactionCreated: "+e.message)
        throw e
    }
}

const addSetterTransactionFromOwner = async (type, ownerId, propertyId, price) => {
    try{
        const transactionObject = await basicTransaction(type, ownerId, propertyId)
        transactionObject.price = price
        transactionObject.hash = hashObject(transactionObject)
        return insertTransaction(transactionObject)
    }catch (e) {
        _count--
        console.error("addTransactionSetForSelling: "+e.message)
        throw e
    }
}

const addTransactionSetForSell = async (ownerId, propertyId, price) => {
    return await addSetterTransactionFromOwner(types.setForSell, ownerId, propertyId, price)
}

const addTransactionSetForRent = async (ownerId, propertyId, price) => {
    return await addSetterTransactionFromOwner(types.setForRent, ownerId, propertyId, price)
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
        _count--
        console.error("addTransactionSetForSelling: "+e.message)
        throw e
    }
}


const addTransactionBuy = async (ownerId, buyerId, propertyId, price) => {
    try{
        const transactionObject = await basicTransaction(types.buy, ownerId, propertyId)
        transactionObject.price = price
        transactionObject.buyerId = buyerId
        transactionObject.hash = hashObject(transactionObject)
        return insertTransaction(transactionObject)
    }catch (e) {
        _count--
        console.error("addTransactionSetForSelling: "+e.message)
        throw e
    }
}

const getTransactionsByOwnerId = async (req, res) => {
    try {
        const transactions = await findTransactionsByOwnerId(req.body.ownerId)
        res.json({success: true, result: transactions});
    } catch (e) {
        res.json({success: false, msg: e.message});
    }
}

const getTransactionsByPropertyId = async (req, res) => {
    try {
        const id = new ObjectId(req.params.id)
        const transactions = await findTransactionsByPropertyId(id)
        res.json({success: true, result: transactions});
    } catch (e) {
        res.json({success: false, msg: e.message});
    }
}

const getAllTransactions = async (req, res) => {
    try {
        const transactions = await findTransactions()
        res.json({success: true, result: transactions});
    } catch (e) {
        res.json({success: false, msg: e.message});
    }
}


const getLastTransaction = async (req, res) => {
    try {
        const transactions = await findLastTransaction()
        res.json({success: true, result: transactions});
    } catch (e) {
        res.json({success: false, msg: e.message});
    }
}

module.exports = {addTransactionCreated, addTransactionSetForSell, addTransactionSetForRent, addTransactionRent, addTransactionBuy, types,
    getTransactionsByOwnerId, getTransactionsByPropertyId, getAllTransactions, getLastTransaction};