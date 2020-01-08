module.exports = {
    getHomePage: (req, res) => {
        let query = "SELECT * FROM `materials` ORDER BY ID ASC"; // query database to get all the players

        // execute query
        db.query(query, (err, result) => {
            if (err) {
                res.redirect('/');
            }
            res.render('index.ejs', {
                title: "Welcome to Telecoupling"
                ,materials: result
            });
        });
    },
};
