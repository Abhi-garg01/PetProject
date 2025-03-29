var express = require("express");
var path = require("path");
var fileuploader = require("express-fileupload");
var mysql = require("mysql");
//var md5 = require("md5");
var nodemailer = require("nodemailer");

var app = express();

app.listen(2022, function () {
    console.log("server started");
})
//==================================================

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(fileuploader());
//==================================================

app.get("/", function (req, resp) {
    var path = process.cwd() + "/public/index.html";
    resp.sendFile(path);
});

app.get("/admin", function (req, resp) {
    var path = process.cwd() + "/public/dash-admin.html";
    resp.sendFile(path);
})
//==================================================
//Database Connectivity
// var dbConfigurationObj = {
//     host: "127.0.0.1",
//     user: "root",
//     password: "A#1134@grg",
//     database: "projects"
// };

var dbConfigurationObj = {
    host: "bdswuctalkpegevloytk-mysql.services.clever-cloud.com",
    user: "u0kpnflpji7suos3",
    password: "iY0YjOwxbr3hTjRWfHoQ",
    database: "bdswuctalkpegevloytk",
    dateStrings:true,
    kepAlive:10000,
    enableKeepAlive:true
};

//==================================================

var dbRef = mysql.createConnection(dbConfigurationObj);
dbRef.connect(function (err) {
    if (err == null)
        console.log("Mysql server connected");
    else
        console.log("MySQL connection error: ", err.message);
});

// Handle database connection loss and automatically reconnect
dbRef.on('error', function(err) {
    console.log('Database error:', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Database connection lost. Reconnecting...');
        dbRef = mysql.createConnection(dbConfigurationObj);
        dbRef.connect(function(err) {
            if (err) {
                console.log('Error reconnecting to database:', err);
            } else {
                console.log('Database reconnected successfully');
            }
        });
    } else {
        throw err;
    }
});
//==================================================

app.get("/db-signup", function (req, resp) {

    var data = [req.query.email, req.query.pwd, req.query.type];
    var mailer = req.query.email;

    dbRef.query("insert into users value(?,?,?,current_date(),1)", data, function (err) {

        if (err) {
            resp.send("Already a User");
        }

        else {
            resp.send("Sign Up Successfully......");
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'gargabhi341@gmail.com',
                    pass: 'gwbu thmu nvkx plld'
                }
            });

            var mailOptions = {
                from: 'gargabhi341@gmail.com',
                to: mailer,
                subject: 'Welcome To PetCare',
                text: 'Sign Up Successfully.....'
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Email sent:' + info.response);
                }
            });
        }

    });


});
//==================================================

app.get("/db-login", function (req, resp) {
    console.log("Login request received:", req.query);
    
    // Verify that we have the required parameters
    if (!req.query.email || !req.query.pwd) {
        console.log("Missing email or password");
        return resp.status(400).send("Email and password are required");
    }
    
    try {
    var data = [req.query.email, req.query.pwd];
        
        // Add timeout to ensure response is sent even if database query hangs
        const queryTimeout = setTimeout(() => {
            console.log("Database query timeout");
            if (!resp.headersSent) {
                resp.status(500).send("Database query timeout. Please try again.");
            }
        }, 5000);
        
        dbRef.query("select * from users where email=? and password=?", data, function (err, table) {
            // Clear the timeout since we got a response
            clearTimeout(queryTimeout);
            
            console.log("Query results:", err, table);
            
            if (err) {
                console.log("Database error:", err);
                if (!resp.headersSent) {
                    resp.status(500).send("Database error: " + err.message);
                }
                return;
            }

            if (table && table.length == 1) {
                if (table[0].status == 1) {
                    console.log("Valid login for:", table[0].userType);
                    if (table[0].userType == "Client") {
                        console.log("Sending 'Client Logined' response");
                        return resp.send("Client Logined");
                    } else if (table[0].userType == "Care Taker") {
                        console.log("Sending 'Care Taker Logined' response");
                        return resp.send("Care Taker Logined");
                    } else {
                        console.log("Unknown user type:", table[0].UserType);
                        return resp.send("Unknown user type");
                    }
                } else if (table[0].status == 0) {
                    console.log("User is blocked");
                resp.send("You Are Blocked");
                }
            } else {
                console.log("Invalid login attempt");
                resp.send("Invalid (Please Check Email Or Password)");
            }
        });
    } catch (ex) {
        console.log("Exception in login handler:", ex);
        if (!resp.headersSent) {
            resp.status(500).send("Server error: " + ex.message);
        }
    }
});
//==================================================

app.post("/profile-save", function (req, resp) {
    console.log(req.body);
    var email = req.body.Email;
    var name = req.body.Name;
    var contact = req.body.contactn;
    var address = req.body.Address;
    var city = req.body.City;
    var state = req.body.stateList;
    var pincode = req.body.Pin;
    var id = email + "-" + req.files.id.name;
    var pets = req.body.Detail;

    var des = path.join(__dirname, "public", "uploads", id);
    req.files.id.mv(des, function (err) {
        if (err)
            console.log(err);
        else
            console.log(req.files.id.name + "uploaded");
    })

    var data = [email, name, contact, address, city, state, pincode, id, pets];
    dbRef.query("insert into profile values(?,?,?,?,?,?,?,?,?)", data, function (err) {

        if (err)
            resp.send(err);
        else
            resp.send("Data Saved");
    });
});
//==================================================

app.post("/profile-edit", function (req, resp) {
    console.log(req.body);

    var email = req.body.Email;
    var name = req.body.Name;
    var contact = req.body.contactn;
    var address = req.body.Address;
    var city = req.body.City;
    var state = req.body.stateList;
    var pincode = req.body.Pin;
    //var idproof = "";
    var pet = req.body.Detail;

    var fileName;
    if (req.files != null) {
        fileName = email + "-" + req.files.id.name;
        var des = path.join(__dirname, "public", "uploads", fileName);
        req.files.id.mv(des, function (err) {
            if (err)
                console.log(err.toString());
            else
                console.log("File Uploaded");
        })

    }
    else
        fileName = req.body.hdnn;

    var dataAry = [name, contact, address, city, state, pincode, fileName, pet, email];

    dbRef.query("update profile set name=?,contact=?,address=?,city=?,state=?,pin=?,idproof=?,pet=? where email=?", dataAry, function (err, result) {
        if (err)
            resp.send(err);

        if (result.affectedRows == 1)
            resp.send("Data Updated");
        else
            resp.send(" Invalid emailid");
    })
});
//==================================================

app.get("/search", function (req, resp) {
    var data = [req.query.email];

    dbRef.query("select * from profile where email=?", data, function (err, table) {
        if (err)
            resp.send(err.message);
        else
            resp.send(table);
    })
});
//==================================================

app.get("/show-all-users", function (req, resp) {
    dbRef.query("select * from users", function (err, table) {
        console.log(err);
        if (err)
            resp.send(err.sqlMessage);
        else
            resp.json(table);
    })
});
//==================================================

app.get("/block-user", function (req, resp) {
    var data = [req.query.Email];
    dbRef.query("update users set status=0 where email=?", data, function (err, table) {
        if (err)
            resp.send(err.sqlMsg);
        else
            resp.json(table);
    })
});
//==================================================

app.get("/activate-user", function (req, resp) {
    var data = [req.query.Email];
    dbRef.query("update users set status=1 where Email=?", data, function (err, table) {
        if (err)
            resp.send(err.sqlMsg);
        else
            resp.json(table);
    })
});
//==================================================

app.get("/show-client-profile", function (req, resp) {
    dbRef.query("select * from profile", function (err, table) {
        console.log(err);
        if (err)
            resp.send(err.sqlMessage);
        else
            resp.json(table);
    })
})
//==================================================

app.get("/delete-client", function (req, resp) {
    var dataAry = [req.query.email];

    dbRef.query("delete from profile where email=?", dataAry, function (err, table) {
        if (err)
            resp.send(err.sqlMessage);
        else
            if (table.affectedRows == 1)
                resp.send("Deleted");
            else
                resp.send("Invalid ID");

    })
})
//==================================================

app.get("/show-caretaker-profile", function (req, resp) {
    dbRef.query("select * from caretaker", function (err, table) {
        if (err)
            resp.send(err.sqlMessage);
        else
            resp.json(table);
    })
})
//==================================================

app.get("/delete-caretaker", function (req, resp) {
    var dataAry = [req.query.email];

    dbRef.query("delete from caretaker where email=?", dataAry, function (err, table) {
        if (err)
            resp.send(err.sqlMessage);
        else
            if (table.affectedRows == 1)
                resp.send("Deleted");
            else
                resp.send("Invalid ID");

    })
})
//==================================================

app.post("/caretaker-save", function (req, resp) {
    // console.log(req.body);
    var email = req.body.Email;
    var name = req.body.Name;
    var contact = req.body.contact;
    var firmweb = req.body.Frm;
    var address = req.body.Address;
    var city = req.body.City;
    var pets = req.body.pets.toString();
    var info = req.body.info;

    var data = [email, name, contact, firmweb, address, city, pets, info];
    dbRef.query("insert into caretaker values(?,?,?,?,?,?,?,?)", data, function (err) {

        if (err)
            resp.send(err);
        else
            resp.send("Data Saved");
    });
});
//==================================================

app.post("/caretaker-update", function (req, resp) {
    console.log(req.body);

    var email = req.body.Email;
    var name = req.body.Name;
    var contact = req.body.contact;
    var firmweb = req.body.Frm
    var address = req.body.Address;
    var city = req.body.City;
    var pets = req.body.pets.toString();
    var info = req.body.info;

    var dataAry = [name, contact, firmweb, address, city, pets, info, email];
    console.log(req.body);
    dbRef.query("update caretaker set name=?,contact=?,firmweb=?,address=?,city=?,pets=?,info=? where email=?", dataAry, function (err, result) {
        if (err)
            resp.send(err);

        else if (result.affectedRows == 1)
            resp.send("Data Updated");
        else
            resp.send("Invalid emailid");
    });
});
//==================================================

app.get("/searchCaretaker", function (req, resp) {
    var data = [req.query.email];

    dbRef.query("select * from caretaker where email=?", data, function (err, table) {
        if (err)
            resp.send(err.message);
        else
            resp.send(table);
    })
});
//==================================================

app.get("/fetch-all-cities", function (req, resp) {
    dbRef.query("select distinct city from caretaker", function (err, table) {

        if (err)
            resp.send(err.sqlMsg);
        else
            resp.send(table);

    })
})
//==================================================

app.get("/fetch-all-caretakers", function (req, resp) {
    var data = [req.query.City, "%" + req.query.pet + "%"];
    dbRef.query("select *from caretaker where city=? and pets like?", data, function (err, table) {

        if (err)
            resp.send(err.sqlMsg);
        else
            resp.send(table);
    });
});
//==================================================

app.get("/moreInfo", function (req, resp) {
    var data = [req.query.Email];
    dbRef.query("select * from caretaker where email=?", data, function (err, table) {
        if (err){
            console.log("here");
            resp.send(err.sqlMessage);
        }
        else{
            console.log(table.toString());
            resp.send(table);
        }
    });

});
//==================================================

app.get("/change-c-password", function (req, resp) {
    var email = req.query.Email;
    var oldpass = req.query.oldpass;
    var newpass = req.query.newpass;

    var data = [email, oldpass, newpass];
    dbRef.query("select * from users where Email=? and Password=?", data, function (err, table) {
        if (err != null)
            resp.send(err.toString());
        else if (table.length == 1) {
            if (newpass) {
                if (table[0].UserType == "Client") {
                    var data = [newpass, email];
                    dbRef.query("update users set Password=? where Email=?", data, function (err, result) {
                        if (err != null)
                            resp.send(err.toString());
                        else
                            resp.send("Change Password Successfully.......");
                    });
                }
                else {
                    resp.send("U Are Not Client");
                }
            }
            else {
                resp.send("Fill New Password");
            }
        }
        else
            resp.send("Plz Check Your Email Or Old Password");

    })
});
//==================================================

app.get("/change-ct-pass", function (req, resp) {
    var email = req.query.pEmail;
    var oldpass = req.query.oldpass;
    var newpass = req.query.newpass;

    var data = [email, oldpass, newpass];
    dbRef.query("select * from users where Email=? and Password=?", data, function (err, table) {
        if (err != null)
            resp.send(err.toString());
        else if (table.length == 1) {
            if (newpass) {
                if (table[0].UserType == "Care Taker") {
                    var data = [newpass, email];
                    dbRef.query("update users set Password=? where Email=?", data, function (err, result) {
                        if (err != null)
                            resp.send(err.toString());
                        else
                            resp.send("Change Password Successfully......");
                    });
                }
                else {
                    resp.send("You Are Not Care Taker");
                }
            }
            else {
                resp.send("Fill New Password");
            }
        }
        else
            resp.send("Plz Check Your Email Or Old Password");

    })
});