const {findByPropertiesByOwner, findByPropertyId, insertProperty, findProperties} = require("../model/property")

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

const addProperty = async (req, res) => {
    console.log("create property "+ req.body)

    const currentDate = new Date()
    const newProperty = {
        ownerId: req.body.ownerId,
        contactNumber: req.body.contactNumber,
        createdAt: currentDate,
        description: req.body.description,
        zipcode: req.body.zipcode,
        city: req.body.city,
        country: req.body.country,
        isApartment: req.body.isApartment,
        apartmentNumber: req.body.apartmentNumber,
        type: null,
        startAt: null,
        endAt: null,
        img: [req.body.img],
    };
    try {
        const property = await insertProperty(newProperty)
            .then((property) => {

                res.json({success: true, msg: property});
            })
    } catch (e) {
        res.json({success: false, msg: err});
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

module.exports = {addProperty, getProperties};
