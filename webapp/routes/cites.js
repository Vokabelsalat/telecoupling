module.exports = {
	getTrade: (req, res) => {
        let taxon = req.params.taxon;
        let query = knex.select().from("trade").where({ "Taxon": taxon });
        query.then(rows => {
            res.end(JSON.stringify(rows));
        });
    },	
};