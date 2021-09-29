const {insertUser, findByEmail} = require("../model/user")
const passwordUtils = require('../lib/passwordUtils');

// const user = {
//     firstname: req.body.firstname,
//     lastname: req.body.lastname,
//     email: req.body.email,
//     hash: hash,
//     salt: salt,
//     // $currentDate: {
//     //     createdAt: true,
//     // },
// }


const addUser = async (req, res) => {
    console.log("addUser "+ JSON.stringify(req.body))
    const user = await findByEmail(req.body.email)
    if (user) {
        res.json({success: false, msg: 'email already in use'});
    }

    const saltHash = passwordUtils.genPassword(req.body.password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newUser = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        hash: hash,
        salt: salt,
    };

    insertUser(newUser)
        .then((user) => {
            res.redirect('/signIn')
        })
        .catch((err) => {
            res.json({success: false, msg: err});
        });
};



module.exports = {addUser};
