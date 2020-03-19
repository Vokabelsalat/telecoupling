module.exports = {
    getSpecies: (req, res) => {
        //let tradeName = req.params.tradeName;
        let family = req.params.family;
        let genus = req.params.genus;
        let species = req.params.species;
        let scientificName = genus.trim() + " " + species.trim();
        let query = knex.select().from("species").where({ "Scientific Name": scientificName });
        query.then(rows => {
            res.end(JSON.stringify(rows));
        });
    },
    getSpeciesJustGenus: (req, res) => {
        //let tradeName = req.params.tradeName;
        let family = req.params.family;
        let genus = req.params.genus;
        let query = knex.select().from("species").where({ "Genus": genus });
        query.then(rows => {
            res.end(JSON.stringify(rows));
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