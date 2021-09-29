const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {findByEmail, findByUserIdAndUpdate} = require("../model/user")
const validPassword = require("../lib/passwordUtils").validPassword;

const customFields = {
    _usernameField: "email",
    _passwordField: "password"
}

const verifyCallback = (email, password, cb) => {
    findByEmail(email)
        .then((user) => {
            if (!user) { return cb(null, false) }
            const isValid = validPassword(password, user.hash, user.salt);
            if (isValid) {
                return cb(null, user);
            } else {
                return cb(null, false);
            }
        })
        .catch((err) => {
            cb(err);
        });
}
const strategy = new LocalStrategy(customFields, verifyCallback)

passport.use(strategy);

passport.serializeUser((user, cb) => {
    cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
    findByUserIdAndUpdate(id, {$currentDate: {lastTimeAuth: true}})
         .then((user) => {cb(null, user.value)})
         .catch((err) => {return cb(err)});
});