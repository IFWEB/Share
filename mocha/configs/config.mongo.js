var env = process.env.NODE_ENV || 'development';

var config = {
    "development": {
        db: 'mongodb://localhost/devDemo'
    },
    "production": {
        db: 'mongodb://localhost/prodDemo'
    },
    "test": {
        db: 'mongodb://localhost/testDemo'
    }
}

module.exports = config[env];