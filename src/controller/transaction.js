const {hashObject} = require("../lib/passwordUtils");

const {getLastTransaction, insertTransaction} = require("../model/transaction")

const types = {
    create: 1,
    sell: 2,
    buy: 3,
    setForRent: 4,
    rent: 5,
}

const getLastTransactionHash = async () => {
    const lastDoc = await getLastTransaction()
    try {
        return  lastDoc.hash
    } catch (e) {
        return Array(65).join("0")
    }
}

const basicTransaction = (type, ownerId, propertyId, previousHash) => {
    console.log("type " + type)
  return {
      type: type,
      ownerId: ownerId,
      propertyId: propertyId,
      previousHash: previousHash,
  }
}

const getTransactionCreatedObj = (ownerId, propertyId, previousHash) => {
    const transactionObject = basicTransaction(types.create, ownerId, propertyId, previousHash)
    transactionObject.hash = hashObject(transactionObject)
    return transactionObject
}

const addTransactionCreated = async (ownerId, propertyId) => {
    try{
        const previousHash = await getLastTransactionHash()
        const trx = getTransactionCreatedObj(ownerId, propertyId, previousHash)
        return insertTransaction(trx)
    }catch (e) {
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