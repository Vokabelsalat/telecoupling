module.exports = {
    getSpecies: (req, res) => {
        let scientificName = req.params.scientificName;
        let query = knex.select().from("species").where({ "Scientific Name": scientificName });
        query.then(rows => {
            if(rows.length > 0) {
                res.json(rows);
            }
            else {
                res.end();
            }
        });
    },
    getSpeciesJustGenus: (req, res) => {
        //let tradeName = req.params.tradeName;
        let genus = req.params.genus;
        let query = knex.select().from("species").where({ "Genus": genus });
        query.then(rows => {
            if(rows.length > 0) {
                res.json(rows);
            }
            else {
                res.end();
            }
        });
    },
    searchSpeciesNotes: (req, res) => {
        let word = req.params.word;
        let query = knex.select("Scientific Name", "Full note", "# Full note").from("species").where("Full note", "like", "%" + word + "%").orWhere("# Full note", "like", "%" + word + "%");
        query.then(rows => {
            res.end(JSON.stringify(rows));
        });
    },
    searchSpeciesNotesPage: (req, res) => {
        let word = req.params.word;
        let query = knex.select("Scientific Name", "Full note", "# Full note").from("species").where("Full note", "like", "%" + word + "%").orWhere("# Full note", "like", "%" + word + "%");
        query.then(rows => {
            res.render('species.ejs', {
                title: "Species",
                message: '',
                entries: rows
            });
        });
    }
};