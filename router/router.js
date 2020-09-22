module.exports = function(app) {
    const task = require('../controllers/task');
    const auth = require('../controllers/auth');

    /*
     * start users
     */
    app.route('/api/auth/register')
        .post(auth.register)

    app.route('/api/auth/login')
        .post(auth.login)

    app.route('/api/profile')
        .get(auth.profile)

    /*
     * end users
     * than
     * begin tasks
     */
     app.route('/api/task/create')
     .post(task.create)

     app.route('/api/task/update')
     .post(task.update)

     app.route('/api/task/today')
     .get(task.getToday)

     app.route('/api/task/forever/:is')
     .get(task.getForeverToday)

     app.route('/api/task/:name')
     .get(task.getTaskByName)

     app.route('/api/task/detail/:id')
     .get(task.getTaskById)


    app.get('/api/ping', function (req, res) {
        res.status(200).json("How are you? i`m Fine. Thanks ")
    })
};
