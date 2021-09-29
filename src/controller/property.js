const {findByPropertiesByOwner, findByPropertyId, insertProperty, findProperties, findAndUpdateProperty,
    findPropertyById
} = require("../model/property")
const {addTransactionCreated} = require("../controller/transaction")
const {addTransactionSetForSell, addTransactionSetForRent, addTransactionRent, types: transactionTypes} = require("./transaction");
const {findTransactions} = require("../model/transaction");
const ObjectId = require("mongodb").ObjectId
//    const newProperty = {
//         ownerId: req.body.ownerId,
//         contactNumber: req.body.contactNumber,
//         createdAt: new Date(),
//         description: req.body.description,
//         zipcode: req.body.zipcode,
//         city: req.body.city,
//         country: req.body.country,
//         isApartment: req.body.isApartment,
//         apartmentNumber: req.body.apartmentNumber,
//         price: req.body.price,
//         startAt: req.body.startAt,
//         endAt: req.body.endAt,
//         type: req.body.type,
//         img: [req.body.img],
//     };

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
    if (!checkAuth(req, res)) {return}

    const currentDate = new Date()
    const newProperty = {
        ownerId: req.user._id,
        contactNumber: req.body.contactNumber,
        description: req.body.description,
        zipcode: req.body.zipcode,
        city: req.body.city,
        country: req.body.country,
        isApartment: req.body.isApartment,
        apartmentNumber: req.body.apartmentNumber,
        createdAt: currentDate,
        type: types.notForSaleOrRent,
        startAt: null,
        endAt: null,
        // img: req.body.img,
    };
    try {

        const property = await insertProperty(newProperty)
        console.log("addProperty: property ")
        console.log(property)
        const trx = await addTransactionCreated(req.user._id, property.insertedId)
        console.log("addProperty: transaction ")
        console.log(trx)

        res.json({success: true, msg: property});
    } catch (err) {
        res.json({success: false, msg: err.message});
    }
};

const getProperties = (req, res) => {
    findProperties()
        .then((properties) => {
            res.json(properties);
        })
        .catch((err) => {
            res.json({success: false, msg: err});
        })

};

const setPropertyForSale = async (req, res) => {
    console.log("setPropertyForSale " + types.forSale)
    console.log(req.body)
    if (!checkAuth(req, res)) {return}
    try {
        const propertyId = new ObjectId(req.body.propertyId);
        const userId = new ObjectId(req.user._id);
        const price = req.body.price;

        const trx = addTransactionSetForSell(userId, propertyId, price)
        const updated = findAndUpdateProperty(
            {_id: new ObjectId(propertyId), ownerId: userId},
            {price: price, type: types.forSale}
        )
        await trx
        res.json({updated: await updated})
        console.log(updated)
    }catch (e) {
        res.json({success: false, msg: err});
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
        const startAt = new Date(req.body.startAt);
        const endAt = new Date(req.body.endAt);

        const trx = addTransactionSetForRent(userId, propertyId, price, startAt, endAt)
        const updated = findAndUpdateProperty(
            {_id: propertyId, ownerId: userId},
            {price: price, type: types.forRent, startAt: startAt, endAt: endAt}
        )
        await trx
        res.json({updated: await updated})
        console.log(updated)
    }catch (e) {
        res.json({success: false, msg: err});
        console.log(e.message)
    }
}


const rentProperty = async (req, res) => {
    console.log("rentProperty "+ types.rent)
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

        if (startAt < property.startAt  || property.endAt < endAt) {

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
                    {$and: [ { startAt : {$lte: endAt}}, { startAt : {$gte: startAt} } ] },
                    {$and: [ { endAt : {$lte: endAt}}, { endAt : {$gte: startAt} } ] },
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
        ).toArray()

        console.log(checkPeriodResult)
        if (checkPeriodResult.length !== 0) {
            res.json({success: false, msg: "wrong period 2"});
            return
        }

        await addTransactionRent(property.ownerId, buyerId, propertyId, property.price, startAt, endAt)
        res.json({success: true})
    }catch (e) {
        res.json({success: false, msg: e});
        console.log(e.message)
    }
}





module.exports = {addProperty, getProperties, setPropertyForSale, setPropertyForRent, rentProperty};
