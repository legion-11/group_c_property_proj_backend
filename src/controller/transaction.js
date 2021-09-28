const {hashObject} = require("../lib/passwordUtils");
const Type = {
    create: 1,
    sell: 2,
    buy: 3,
    setForRent: 4,
    rent: 5,
}

const getTransactionCreated = async (ownerId, propertyId, previousHash) => {
    try {
        const transactionObject = {
            type: Type.create,
            ownerId: ownerId,
            propertyId: propertyId,
            previousHash: previousHash,
        }
        transactionObject.hash = hashObject(transactionObject)

        return transactionObject
    }catch (e) {
        console.log(e)
    }
}