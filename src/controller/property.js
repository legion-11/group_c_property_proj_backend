const {findByPropertiesByOwner, findByPropertyId, insertProperty, findProperties, findAndUpdateProperty,
    findPropertyById
} = require("../model/property")
const {addTransactionCreated} = require("../controller/transaction")
const {addTransactionSetForSell, addTransactionSetForRent, addTransactionRent, types: transactionTypes,
    addTransactionBuy
} = require("./transaction");
const {findTransactions} = require("../model/transaction");
const ObjectId = require("mongodb").ObjectId

const types = {
    notForSaleOrRent: 0,
    forSale: 1,
    forRent: 3
}

const checkAuth = (req, res) => {

    if (!req.isAuthenticated()) {
        res.json({success: false, msg: "You are not authenticated"});
        return false
    }
    return true
}

const addProperty = async (req, res) => {
    console.log("addProperty " + types.forSale+ " " + JSON.stringify(req.body))
    console.log(req.user)
    if (!checkAuth(req, res)) {return}

    const newProperty = {
        ownerId: req.user._id,
        contactNumber: req.body.contactNumber,
        description: req.body.description,
        zipcode: req.body.zipcode,
        city: req.body.city,
        country: req.body.country,
        apartmentNumber: req.body.apartmentNumber,
        type: types.notForSaleOrRent
        // img: req.body.img,
    };
    try {

        const property = await insertProperty(newProperty)
        console.log("addProperty: property ")
        console.log(property)
        const trx = await addTransactionCreated(req.user._id, property.insertedId)
        console.log("addProperty: transaction ")
        console.log(trx)

        res.json({success: true, result: property});
    } catch (err) {
        res.json({success: false, msg: err.message});
    }
};

const getProperties = async (req, res) => {
    try {
        const type = parseInt(req.query.type)
        const properties = await findProperties({type: type})
        res.json({success: true, result: properties});
    }catch (e) {
        res.json({success: false, msg: e.message});
    }
};

const setPropertyForSale = async (req, res) => {
    console.log("setPropertyForSale " + types.forSale)
    console.log(req.body)
    if (!checkAuth(req, res)) {return}
    try {
        const propertyId = new ObjectId(req.body.propertyId);
        const userId = new ObjectId(req.user._id);
        const price = req.body.price;

        const trx = await addTransactionSetForSell(userId, propertyId, price)
        const updated = await findAndUpdateProperty(
            {_id: propertyId, ownerId: userId},
            {price: price, type: types.forSale}
        )
        res.json({success: true, result:  updated})
        console.log(updated)
    }catch (e) {
        res.json({success: false, msg: e.message});
        console.log(e.message)
    }
}

const setPropertyForRent = async (req, res) => {
    console.log("setPropertyForRent "+ types.forRent)
    console.log(req.body)
    if (!checkAuth(req, res)) {return}
    try {
        const propertyId = new ObjectId(req.body.propertyId);
        const userId = req.user._id;
        const price = req.body.price;

        const trx = await addTransactionSetForRent(userId, propertyId, price)
        const updated = await findAndUpdateProperty(
            {_id: propertyId, ownerId: userId},
            {price: price, type: types.forRent}
        )
        res.json({success: true, result: updated})
        console.log(updated)
    }catch (e) {
        res.json({success: false, msg: e.message});
        console.log(e.message)
    }
}


const rentProperty = async (req, res) => {
    console.log("rentProperty "+ transactionTypes.rent)
    console.log(req.body)
    if (!checkAuth(req, res)) {return}
    try {
        const propertyId = new ObjectId(req.body.propertyId);
        const property = await findPropertyById(propertyId);
        console.log(property)

        if (!property) {
            res.json({success: false, msg: " not found"});
            return
        }

        if (property.type !== types.forRent) {
            res.json({success: false, msg: "not for rent"});
            return
        }

        const startAt = new Date(req.body.startAt);
        const endAt = new Date(req.body.endAt);
        const buyerId = req.user._id;
        if (startAt < new Date()  || endAt < new Date() ) {
            res.json({success: false, msg: "wrong period"});
            return
        }

        if (property.ownerId.toString() === buyerId.toString()) {
            res.json({success: false, msg: "can not buy from yourself"});
            return
        }

        const checkPeriodResult = await findTransactions(
            {
                propertyId: propertyId,
                type: transactionTypes.rent,
                $or: [
                    { $and: [ { startAt : {$lte: endAt}}, { startAt : {$gte: startAt} } ] },
                    { $and: [ { endAt : {$lte: endAt}}, { endAt : {$gte: startAt} } ] },
                    {
                        $and:
                            [
                                { startAt : {$lte: endAt} },
                                { startAt : {$lte: startAt} },
                                { endAt : {$gte: endAt} },
                                { endAt : {$gte: startAt} }
                            ]
                    },
                ]
            },
            {}
        )

        console.log(checkPeriodResult)
        if (checkPeriodResult.length !== 0) {
            res.json({success: false, msg: "Someone already rented for this period"});
            return
        }

        await addTransactionRent(property.ownerId, buyerId, propertyId, property.price, startAt, endAt)
        res.json({success: true})
    }catch (e) {
        res.json({success: false, msg: e.message});
        console.log(e.message)
    }
}

const buyProperty = async (req, res) => {
    console.log("buy")
    if (!checkAuth(req, res)) {return}
    const propertyId = new ObjectId(req.body.propertyId);
    const buyerId = req.user._id;

    try {
        const property = await findPropertyById(propertyId);

        if (!property) {
            res.json({success: false, msg: " not found"});
            return
        }

        if (property.type !== types.forSale) {
            res.json({success: false, msg: "not for sale"});
            return
        }

        if (property.ownerId.toString() === buyerId.toString()) {
            res.json({success: false, msg: "can not buy from yourself"});
            return
        }

        await addTransactionBuy(property.ownerId, buyerId, property._id, property.price)

        const updated = await findAndUpdateProperty(
            {_id: propertyId},
            {ownerId: buyerId, type: types.notForSaleOrRent}
        )
        res.json({success: true})
        console.log(updated)
    }catch (e) {
        res.json({success: false, msg: e.message});
        console.log(e.message)
    }
}

const getProperty = async (req, res) => {
    const id = req.params.id
    try {
        const result = await findPropertyById(new ObjectId(id))
        res.json({success: true, result: result})
    }catch (e) {
        res.json({success: false, msg: "Wrong input"})
    }
}
module.exports = {addProperty, getProperties, setPropertyForSale, setPropertyForRent, rentProperty, buyProperty, getProperty};
