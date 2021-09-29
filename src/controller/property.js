const {findByPropertiesByOwner, findByPropertyId, insertProperty, findProperties, findAndUpdateProperty} = require("../model/property")
const {addTransactionCreated} = require("../controller/transaction")

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
    forSale: 0,
    forRent: 1,
    notForSaleOrRent: 2
}

const checkAuth = (req, res) => {

    if (!req.isAuthenticated()) {
        res.json({success: false, msg: "You are not authenticated"});
        return false
    }
    return true
}

const addProperty = async (req, res) => {
    if (!checkAuth(req, res)) {return}

    console.log("addProperty "+ JSON.stringify(req.body))

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
    if (!checkAuth(req, res)) {return}
    const propertyId = req.body.propertyId;
    const userId = req.user._id;
    const price = req.body.price;

    try {
        const updated = await findAndUpdateProperty(
            {_id: propertyId, ownerId: userId},
            {price: price, type: types.forSale}
        )
        console.log(updated)
    }catch (e) {
        console.log(e.message)
    }

}
module.exports = {addProperty, getProperties, setPropertyForSale};
