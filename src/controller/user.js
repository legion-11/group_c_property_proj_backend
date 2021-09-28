const {insertUser, findByUserName} = require("../model/user")
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
    const user = await findByUserName(req.body.username)
    console.log("create user "+ req.body)
    if (user) {
        res.json({success: false, msg: 'username already in use'});
    }
    console.log("create user "+ req.body)
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
