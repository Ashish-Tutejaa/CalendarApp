//CONFIG
const CONFIG = require('./config.js');
//END

//EXPRESS
const express = require('express');
const port = 5000;
const app = express();
app.use(express.json());
//END

//DEBUG
const db_err = "DATABASE ERROR: ";
const req_obj = "REQUEST STUFF: ";
const db_q = "DATABASE QUERY: ";
const LH3 = 'http://localhost:3000';
//END

//AUTH
const jwt = require('jsonwebtoken');
const SECRET = CONFIG.secret;
//END
  
//DATABASE STUFF
const mysql = require('mysql');
const { default: config } = require('./config.js');
var connection = mysql.createConnection({
    host : CONFIG.host,
    user : CONFIG.user,
    password : CONFIG.password,
    database : CONFIG.database
})
connection.connect((err) => {
    if(err){
        console.log(db_err,err);
    } else {
        console.log("DB SUCCESS");
    }
});
//END

//CORS MIDDLEWARE
const CORS = (origin,method,header) => {
    return (req,res,next) => {
            res.set({
                'Access-Control-Allow-Origin' : origin,
                'Access-Control-Allow-Method' : method,
                'Access-Control-Allow-Headers' : header
            })
            next();
        }
}
//END

//AUTH MIDDLEWARE
const AUTH = (req,res,next) => {
    if(!req.headers.authorization) {
        res.status(403).end();
        return;
    } 

    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, SECRET, (err, decoded) => {
        if(err){
            res.status(403).end();
            return; 
        }
        req.username = decoded.username;
        next();
    })
}
//END

app.get('/', (req,res) => {
    res.send("<h1>ok</h1>")
})

//CORS PREFLIGHT
app.options('/login', CORS(LH3,'POST','Content-Type'), (req,res) => { 
    res.status(200).end();
})
app.options('/register', CORS(LH3,'POST','Content-Type'), (req,res) => { 
    res.status(200).end();
})
app.options('/getTodos',CORS(LH3,'POST','Authorization, Content-Type'), (req,res) => {
    res.status(200).end();
})
//END

app.post('/login', CORS(LH3,'POST','Content-Type'), (req,res,next) => {

    console.log(req_obj, req.headers);
    console.log(req_obj, req.body);

    connection.query(`SELECT * FROM USERS WHERE UNAME=? AND PASS =?`, [req.body.username, req.body.password],(dberr,dbres) => {
        if(dberr){
            console.log(db_err,err);
            res.status(500).json({err : db_err});
        } else {
            if(dbres.length === 0){
                res.status(401).json({err : "Wrong Username or Password."});
            } else {
                console.log(dbres);
                jwt.sign({username : dbres[0].UNAME},SECRET,(err,token) => {
                    if(err){
                        res.status(500).json({err : "A server error occurred."});
                        return;
                    } 
                res.status(200).json({token});
                })
            }
        }
    })
})

app.post('/register', CORS(LH3,'POST','Content-Type'), (req,res,next) => {
    console.log(req_obj, req.headers);
    console.log(req_obj, req.body);
    connection.query(`SELECT * FROM USERS WHERE UNAME=? AND PASS =?`, [req.body.username, req.body.password],(dberr,dbres) => {
        if(dberr){
            console.log(db_err,err);
            res.status(500).json({err : db_err});
        } else {
            if(dbres.length !== 0){
                res.status(401).json({err : "User already exists, please select a different username."});
            } else {
                let {username, password: pass} = req.body;
                connection.query(`INSERT INTO USERS(UNAME, PASS) VALUES(?,?)`,[username, pass], (dberr,dbres,fields) => {
                    if(dberr){
                        console.log(db_err,dberr);
                        res.status(500).json({err : db_err});
                    } else {
                        jwt.sign({username},SECRET,(err,token) => {
                            if(err){
                                res.status(500).json({err : "A server error occurred."});
                                return;
                            } 
                        res.status(200).json({token});
                        })
                    }

                })
            }
        }
    })
})

app.post('/getTodos', CORS(LH3,'POST','Authorization, Content-Type'), AUTH, (req,res,next) => {
    console.log("RECIEVED")
    console.log(req_obj, req.body);
    console.log(req_obj, req.headers);
    console.log(req_obj, req.username);

    connection.query(`SELECT *
     FROM USERS NATURAL JOIN TODOS
     WHERE UNAME = ?`,[req.username],(dberr,dbres) => {
         if(dberr){
             res.status(500).json({err : dberr});
         } else {
             res.status(200).json({data : dbres})
         }
     })

})

app.listen(port, () => {console.log(`listening@${port}`)})