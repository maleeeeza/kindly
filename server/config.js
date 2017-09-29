exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/kindly';

exports.JWT_SECRET = process.env.JWT_SECRET || 'seriouslycanigetthisdamnthingworking';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

googleAPIKey = "AIzaSyCO3ak9ZUiaSK4JOH6ID3TyQYhUQQCVmeI";
