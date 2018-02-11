(function (data) {
    var database = require("./database");
    data.getDirectory = function (query,next) {
        database.getDirectory(query,next);
    };
})(module.exports);