module.exports = function(app) {
    const user = require('../controllers');
    const auth = require('../controllers/auth');

    app.route('/api/register')
        .post(auth.register)

    app.get('/api/ping', function (req, res) {
        res.status(200).json("How are you? i`m Fine. Thanks ")
    })
};
