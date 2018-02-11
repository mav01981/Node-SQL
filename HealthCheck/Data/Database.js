(function (database) {
    var Connection = require("tedious").Connection;
    var config = {
        userName: 'username',
        password: 'password',
        server: 'server',
        // When you connect to Azure SQL Database, you need these next options.  
        options: {
            database: 'database',
            encrypt: true,
            rowCollectionOnDone: true
        }
    };
    database.getDirectory = function (query,next) {

        var connection = new Connection(config);
        connection.on("connect", function (err) {
            if (err) {
                next(err, null);
            } else {
                var Request = require("tedious").Request;
                var request = new Request(query, function (err, rowCount, rows) {
                    if (err) {
                        next(err, null);
                    }
                }).on("doneInProc", function (rowCount, more, rows) {
                    var jsonArray = [];
                    rows.forEach(function (columns) {
                        var rowObject = {};
                        columns.forEach(function (column) {
                            rowObject[column.metadata.colName] = column.value;
                        });

                        jsonArray.push(rowObject);
                    });
            
                    next(null, jsonArray);
                });

                connection.execSqlBatch(request);
            }
        });
    }
})(module.exports);