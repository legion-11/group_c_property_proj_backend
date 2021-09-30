const router = require('express').Router();
const passport = require('passport');
const {addUser, parseUser} = require("../controller/user")
const {addProperty, getProperties, setPropertyForSale, setPropertyForRent, rentProperty, buyProperty} = require("../controller/property")
const {getTransactionsByOwnerId, getTransactionsByPropertyId,
    getAllTransactions, getLastTransaction} = require("../controller/transaction");

/**
 * -------------- POST ROUTES ----------------
 */

router.post('/signIn', (req, res, next) => {
    passport.authenticate(
        'local',
        (err, user, info) => {
            if (err) throw err;
            if (!user) res.json({success: false, msg: "wrong password or email"});
            else {
                req.logIn(user, (err) => {
                    if (err) throw err;
                    res.json({success: true, user: parseUser(req.user)});
                });
            }
        })(req, res, next)

});

router.post('/signUp', addUser);

router.post('/addProperty', addProperty);

router.post('/buyProperty', buyProperty);

router.post('/rentProperty', rentProperty);

/**
 * -------------- GET ROUTES ----------------
 */

router.get("/getUser", (req, res) => {
    if (!req.user) {
        res.json({user: {}});
        return
    }
    res.json({success: true, user: parseUser(req.user)});
});

router.get('/protected-route', (req, res, next) => {
    console.log(req.user)
    if (req.isAuthenticated()) {
        res.send('<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>');
    } else {
        res.send('<h1>You are not authenticated</h1><p><a href="/signIn">SignIn</a></p>');
    }
});

// Visiting this route logs the user out
router.get('/logout', (req, res, next) => {
    req.logout();
    res.json({success: true});
});


router.get('/getTransactionsByOwner', getTransactionsByOwnerId);

router.get('/getTransactionsByProperty', getTransactionsByPropertyId);

router.get('/getAllTransactions', getAllTransactions);

router.get('/last', getLastTransaction);

router.get('/getProperties', getProperties);

/**
 * -------------- PUT ROUTES ----------------
 */

router.put('/setPropertyForSale', setPropertyForSale);

router.put('/setPropertyForRent', setPropertyForRent);

module.exports = router;