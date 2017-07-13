var express = require('express');
var router = express.Router();
var sqlite3 = require('../node_modules/sqlite3');
var db = new sqlite3.Database('dbConcert.sqlite3');
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

                /****************************************************/
                /* ARTISTS, CONCERT PERFORMANCE GET*/
                /****************************************************/

router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/artists', function(req, res, next) {
    res.render('artist.hbs', {
        visible: true
    });
});

router.get('/concertplace', function(req, res, next) {
    res.render('concert.hbs', {
        visible1: true
    });
});

router.get('/performance', function(req, res, next) {
    res.render('performance.hbs', {
        visible2: true
    });
});

router.get('/getartist', function(req, res, next) {
    db.all("SELECT name, surname, age, id_artist FROM artists", function (err, result){
        res.send(result);
    });
});

router.get('/getconcertplace', function(req, res, next) {
    db.all("SELECT address, seatingcount, type, id_place FROM concertplace", function (err, result){
        res.send(result);

    });
});

router.get('/getperformance', function(req, res, next) {

    var places;
    db.all("SELECT id_place, address FROM concertplace ", function (err, place) {
        places=place;
    });

    db.all("SELECT id_perf, date, concert_place, name, surname  " +
        "FROM  performance LEFT JOIN artists,schedule " +
        "ON id_artist=schedule.sch_artist AND schedule.sch_performance=id_perf " +
        "ORDER BY id_perf", function (err, result){

        var actors = '';
        var id_perf = 1;
        var arr =[];

        for (var i = 0; i < result.length; i++){
            if(+(result[i].id_perf) == +id_perf){
                actors += (result[i].name + result[i].surname + "<br>");
                if(i==result.length-1 || result[i+1].id_perf != id_perf){
                    var tmp;
                    for (var j=0;j<places.length;j++){
                        if(places[j].id_place==result[i].concert_place){
                            tmp=places[j].address;
                        }
                    }
                        arr.push({date: result[i].date , artists: actors, address: tmp});
                }
            }else {
                id_perf = +(result[i].id_perf);
                actors = result[i].name + result[i].surname + "<br>";
                //костыль, если что -УДАЛЯЙ
                if(i==result.length-1 || result[i+1].id_perf != id_perf){
                    var tmp;
                    for (var j=0;j<places.length;j++){
                        if(places[j].id_place==result[i].concert_place){
                            tmp=places[j].address;
                        }
                    }

                    arr.push({date: result[i].date , artists: actors, address: tmp});
                }
            }
        }


        res.send(arr);
    });
});

                /****************************************************/
                /* ADMIN ARTISTS GET POST PUT DELETE*/
                /****************************************************/

router.get('/admin/artists', function(req, res, next) {
    res.render('artistADM.hbs', {
        visible: true
    });
});

router.get("/admin/artists/:id", function(req, res){
    var id = req.params.id;
    db.get("SELECT id_artist, name, surname, age FROM artists WHERE id_artist = '"+id+"'", function (index, result) {
        res.send(result);
    });

});

router.post('/admin/artists', function (req, res) {
    var artistName = req.body.name;
    var artistSurname = req.body.surname;
    var artistAge = req.body.age;

    db.get("SELECT name, surname, age FROM artists WHERE name ='"+artistName.toString()+"'" +
        "AND surname='"+artistSurname.toString()+"'AND age='"+artistAge.toString()+"'", function (err, result) {
        if(!result) {

            db.get("SELECT COUNT(id_artist) FROM artists", function (err, count) {
                db.run("INSERT INTO artists VALUES ('" + (count['COUNT(id_artist)']+1) + "','" + artistName.toString() + "','" + artistSurname.toString() + "','" + artistAge.toString() + "')");
                var obj = {
                    id_artist: (count['COUNT(id_artist)']+1),
                    name:  artistName,
                    surname: artistSurname,
                    age: artistAge
                };
                res.send(obj);
            });
        }
    })
});

router.put("/admin/artists", jsonParser, function(req, res){

    var artistId = req.body.id;
    var artistName = req.body.name;
    var artistSurname = req.body.surname;
    var artistAge = req.body.age;

    db.get("SELECT id_artist, name, surname, age FROM artists WHERE id_artist = '"+artistId+"'", function (index, result) {

        db.run("UPDATE artists SET id_artist = '" + artistId + "', name = '" + artistName + "', surname = '" + artistSurname + "', age = '" + artistAge + "' WHERE id_artist = '" + artistId +"'");

        res.send({id_artist: artistId, name:artistName, surname: artistSurname, age:artistAge});
    });
});

router.delete("/admin/artists/:id", function(req, res){

    var artistId = req.params.id;

    db.get("SELECT id_artist, name, surname, age FROM artists WHERE id_artist = '"+artistId+"'", function (index, result) {

        db.run("DELETE FROM artists WHERE id_artist = '" + artistId +"'");

        res.send({id_artist: artistId});
    });
});

                /****************************************************/
                /* ADMIN CONCERT_PLACE GET POST PUT DELETE*/
                /****************************************************/

router.get('/admin/concertplace', function(req, res, next) {
    res.render('concertADM.hbs', {
        visible1: true
    });
});

router.get("/admin/concertplace/:id", function(req, res){

    var id = req.params.id;
    db.get("SELECT id_place, address, seatingcount, type FROM concertplace WHERE id_place = '"+id+"'", function (index, result) {
        res.send(result);
    });

});

router.post('/admin/concertplace', function (req, res) {
    var address = req.body.address;
    var seatingCount = req.body.seatingCount;
    var type = req.body.type;

    db.get("SELECT address, seatingcount, type FROM concertplace WHERE address ='"+address.toString()+"'" +
        "AND seatingcount='"+seatingCount+"'AND type='"+type.toString()+"'", function (err, result) {
        if(!result) {

            db.get("SELECT COUNT(id_place) FROM concertplace", function (err, count) {
                db.run("INSERT INTO concertplace VALUES ('" + (count['COUNT(id_place)']+1) + "','" + address.toString() + "','" + seatingCount+ "','" + type.toString() + "')");
                var obj = {
                    id_place: (count['COUNT(id_place)']+1),
                    address:  address,
                    seatingcount: seatingCount,
                    type: type
                };
                res.send(obj);
            });
        }
    })
});

router.put("/admin/concertplace", jsonParser, function(req, res){

    var concertId = req.body.id;
    var concertAddress = req.body.address;
    var concertSeatingCount = req.body.seatingcount;
    var concertType = req.body.type;

    db.get("SELECT id_place, address, seatingcount, type FROM concertplace WHERE id_place = '"+ concertId +"'", function (index, result) {

        db.run("UPDATE concertplace SET id_place = '" + concertId + "', address = '" + concertAddress + "', seatingcount = '" + concertSeatingCount + "', type = '" + concertType + "' WHERE id_place = '" + concertId +"'");

        res.send({id_place: concertId, address: concertAddress, seatingcount: concertSeatingCount, type: concertType});
    });
});

router.delete("/admin/concertplace/:id", function(req, res){

    var concertId = req.params.id;

    db.get("SELECT id_place, address, seatingcount, type FROM concertplace WHERE id_place = '"+concertId+"'", function (index, result) {

        db.run("DELETE FROM concertplace WHERE id_place = '" + concertId +"'");

        res.send({id_place: concertId});
    });
});

                /****************************************************/
                /* ADMIN PERFORMANCE GET POST*/
                /****************************************************/

router.get('/admin/performance', function(req, res, next) {
    res.render('performanceADM.hbs', {
        visible2: true
    });
});

router.post('/admin/performance', function (req, res) {
    var date = req.body.date;
    var artists = req.body.artists;
    var concert_place = req.body.concert_place;

    var idPerf;

    db.get("SELECT COUNT(id_perf) FROM performance", function (err, count) {
        idPerf=count['COUNT(id_perf)']+1;
        db.run("INSERT INTO performance VALUES ('" + idPerf + "','" + date + "','" + concert_place + "')");
    });


    db.get("SELECT COUNT(id_sched) FROM schedule", function (err, count) {
        var count1 = (count['COUNT(id_sched)']);
        for (var i=0; i<artists.length;i++) {
            count1++;
            db.run("INSERT INTO schedule VALUES ('" + count1 + "','" + artists[i] + "','" + idPerf + "')");
        }
    });

});

module.exports = router;
