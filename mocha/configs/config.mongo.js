var env = process.env.NODE_ENV || 'development';

var config = {
    "development": {
        db: 'mongodb://127.0.0.1:27017/mocha',
    },
    "production": {
        db: 'mongodb://remoteaddress/dbname'
    }
}

module.exports = config[env];


