const crypto = require('crypto');

function validPassword(password, hash, salt) {
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}
function genPassword(password) {
    const salt = crypto.randomBytes(32).toString('hex');
    const genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return {
        salt: salt,
        hash: genHash
    };
}

const hashObject = (object) => {
    const hash = crypto.createHash('sha256')
        .update(JSON.stringify(object, function (k, v) {
            if (k[0] === "_") return undefined; // remove api stuff
            else if (typeof v === "function") // consider functions
                return undefined;
            else return v;
        }))
        .digest('hex');
    return hash;
}

module.exports = {validPassword, genPassword, hashObject};