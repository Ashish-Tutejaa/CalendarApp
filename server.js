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
const uuid = require('uuid')
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
                'Access-Control-Allow-Methods' : method,
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
app.options('/createTodo', CORS(LH3,'POST','Authorization, Content-Type'), (req,res) => {
    res.status(200).end();
})
app.options('/deleteTodo', CORS(LH3, 'DELETE', 'Authorization, todo-id'), (req,res) => {
    res.status(200).end();
})
app.options('/updateTodo', CORS(LH3, 'PUT', 'Authorization, todo-id'), (req,res) => {
    res.status(200).end();
})
//END

app.post('/login', CORS(LH3,'POST','Content-Type'), (req,res,next) => {

    connection.query(`SELECT * FROM USERS WHERE UNAME=? AND PASS =?`, [req.body.username, req.body.password],(dberr,dbres) => {
        if(dberr){
            console.log(db_err,db_err);
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

app.post('/createTodo', CORS(LH3,'POST','Authorization, Content-Type'), AUTH, (req,res,next) => {
    console.log("CREATING!", req.body.todo);
    const todo = {...req.body.todo};
    connection.query(`INSERT INTO 
    TODOS(TODOID,UNAME,TITLE,DONE,IMPORTANCE,_MONTH,_YEAR,_DAY)
     VALUES (?,?,?,?,?,?,?,?);
    `, [uuid.v1(), req.username, todo.title, 'N', todo.importance, todo.month, todo.year, todo.day], (dberr, dbres, fields) => {
        if(dberr){
            console.log(dberr);
            res.status(500).json({err : dberr});
        } else {
            console.log('successfully inserted...', fields);
            res.status(200).json({data : "DONE"})
        }
    })

})

app.post('/getTodos', CORS(LH3,'POST','Authorization, Content-Type'), AUTH, (req,res,next) => {
    console.log("GET TODOS")
    connection.query(`SELECT *
     FROM USERS NATURAL JOIN TODOS
     WHERE UNAME = ? AND _MONTH = ? AND _YEAR = ?`,[req.username, req.body.month + 1, req.body.year],(dberr,dbres) => {
         if(dberr){
             res.status(500).json({err : dberr});
         } else {
             res.status(200).json({data : dbres})
         }
     })

})

app.delete('/deleteTodo', CORS(LH3, 'DELETE', 'Authorization, todo-id'), AUTH, (req,res,next) => {
    console.log('DELETION...');
    connection.query(`
    DELETE FROM TODOS
    WHERE TODOS.TODOID = ?; 
    `, [req.headers['todo-id']], (dberr, dbres, fields) => {
        if(dberr){
            console.log(dberr);
            res.status(500).json({err : dberr});
        } else {
            res.status(200).json({success : true})
        }
    })
})

app.put('/updateTodo', CORS(LH3, 'PUT', 'Authorization, todo-id'), AUTH, (req,res,next) => {
    console.log('UPDATING...');
    const [todoID, check] = req.headers['todo-id'].split('#');
    let actual = check === 'Y' ? 'N' : 'Y';
    console.log(todoID, check, actual);
    connection.query(`
    UPDATE TODOS
    SET TODOS.DONE = ?
    WHERE TODOS.TODOID = ?; 
    `, [actual, todoID], (dberr, dbres, fields) => {
        console.log(fields, dbres);
        if(dberr){
            console.log(dberr);
            res.status(500).json({err : dberr});
        } else {
            res.status(200).json({success : true})
        }
    })
})

app.listen(port, () => {console.log(`listening@${port}`)})