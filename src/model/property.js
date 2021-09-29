const {getDB} = require("../config/database");

const db = getDB();
const propertyCollectionName = "property";
const propertyCollection = db.collection(propertyCollectionName);

const findPropertiesByOwnerId = (id) => {
    return propertyCollection
        .find({ ownerId: id }).toArray()
};

const findProperties = () => {
    return propertyCollection
        .find().toArray()
};

const findPropertyById = (id) => {
    return propertyCollection
        .findOne({ _id: id })
};

const insertProperty = (property) => {
    return propertyCollection
        .insertOne(property)
};

const findAndUpdateProperty = (query, update) => {
    return propertyCollection.findOneAndUpdate(query, {$set: update})
}



module.exports = {findPropertiesByOwnerId, findPropertyById, insertProperty, findProperties, findAndUpdateProperty};