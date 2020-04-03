module.exports = {
	getTrade: (req, res) => {
        let taxon = req.params.taxon;
        let query = knex.select().from("trade").where({ "Taxon": taxon });
        query.then(rows => {
            res.json(rows);
        });
    },	
	getTradeByGenus: (req, res) => {
        let genus = req.params.genus;
        let query = knex.select().from("trade").where({ "Genus": genus });
        query.then(rows => {
            res.json(rows);
        });
    },	
};