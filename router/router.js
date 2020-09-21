module.exports = function(app) {
    const task = require('../controllers/task');
    const auth = require('../controllers/auth');

    app.route('/api/auth/register')
        .post(auth.register)

    app.route('/api/auth/login')
        .post(auth.login)

    app.route('/api/profile')
        .post(auth.profile)

    app.get('/api/ping', function (req, res) {
        res.status(200).json("How are you? i`m Fine. Thanks ")
    })
};
