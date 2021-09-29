const router = require('express').Router();
const passport = require('passport');
const {addUser} = require("../controller/user")
const {addProperty, getProperties, setPropertyForSale, setPropertyForRent, rentProperty} = require("../controller/property")
const {getTransactionsByOwnerId, getTransactionsByPropertyId,
    getAllTransactions, getLastTransaction} = require("../controller/transaction");

/**
 * -------------- POST ROUTES ----------------
 */

router.post('/signIn',
    passport.authenticate('local', {failureRedirect: "/signIn-failure", successRedirect: "/signIn-success"})
);

router.post('/signUp', addUser);

router.post('/addProperty', addProperty);

router.post('/rentProperty', rentProperty)

/**
 * -------------- GET ROUTES ----------------
 */

router.get('/', (req, res, next) => {
    res.send('<h1>Home</h1><p>Please <a href="/signUp">Sign Up</a></p>');
});

router.get("/user", (req, res) => {
    res.json({user: req.user}); // The req.user stores the entire user that has been authenticated inside of it.
});

// When you visit http://localhost:3000/login, you will see "Login Page"
router.get('/signIn', (req, res, next) => {

    const form = '<h1>SignIn Page</h1><form method="POST" action="/signIn">\
    Enter Username:<br><input type="text" name="username">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);

});

// When you visit http://localhost:3000/register, you will see "Register Page"
router.get('/signUp', (req, res, next) => {
    const form = '<h1>Sign Up Page</h1><form method="post" action="signUp">\
                    Enter Username:<br><input type="text" name="email">\
                    <br>Enter Password:<br><input type="password" name="password">\
                    <br><br><input type="submit" value="Submit"></form>';
    res.send(form);
});

/**
 * Lookup how to authenticate users on routes with Local Strategy
 * Google Search: "How to use Express Passport Local Strategy"
 *
 * Also, look up what behaviour express session has without a maxage set
 */
router.get('/protected-route', (req, res, next) => {
    console.log(req.user)
    // This is how you check if a user is authenticated and protect a route.  You could turn this into a custom middleware to make it less redundant
    if (req.isAuthenticated()) {
        res.send('<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>');
    } else {
        res.send('<h1>You are not authenticated</h1><p><a href="/signIn">SignIn</a></p>');
    }
});

// Visiting this route logs the user out
router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/protected-route');
});

router.get('/signIn-success', (req, res, next) => {
    res.send('<p>You successfully logged in. -->  <a href="/protected-route">Go to protected route</a></p>');
});

router.get('/signIn-failure', (req, res, next) => {
    res.send('You entered the wrong password.');
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