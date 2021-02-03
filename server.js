//CONFIG
const CONFIG = require('./config.js');
//END

//PATH
const path = require('path');

//EXPRESS
const express = require('express');
const port = process.env.PORT || 5000;
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
const mongoose = require('mongoose');  
mongoose.connect(`mongodb+srv://${CONFIG.mongo_uname}:${CONFIG.mongo_pass}@mern.1ft2r.mongodb.net/${CONFIG.mongo_db}?retryWrites=true&w=majority
`, {useUnifiedTopology: true,  useNewUrlParser: true}, (err) => {
    console.log(err);
    console.log("MONGO CONNECTED...");
}); 
const Schema = mongoose.Schema;
const user = new Schema({
    username : {type : String},
    password : {type : String}
})
const todo = new Schema({
    TODOID : {type : String},
    UNAME : {type : String},
    TITLE : {type : String},
    DONE : {type : String},
    IMPORTANCE : {type : Number},
    _MONTH : {type : Number},
    _YEAR : {type : Number},
    _DAY : {type : Number}
})
const userModel = mongoose.model('userModel', user);
const todoModel = mongoose.model('todoModel', todo);
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

    const {body} = req;

    userModel.findOne({username : body.username, password : body.password}, (dberr,dbres) => {
        if(dberr){
            console.log(dberr);
            res.status(500).json({err : db_err});
            return;
        } else {
            console.log(dbres);
            if(dbres === null){
                res.status(401).json({err : "Wrong Username or Password."});
            } else {
                jwt.sign({username : dbres.username},SECRET,(err,token) => {
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

    userModel.findOne({username : req.body.username, password : req.body.password}, (dberr,dbres) => {
        if(dberr){
            console.log(dberr);
            res.status(500).json({err : db_err});
        } else {
            console.log(dbres)
            if(dbres === null){
                const tempUserModel = new userModel();
                tempUserModel.username = req.body.username;
                tempUserModel.password = req.body.password;
                tempUserModel.save((err) => {
                    if(err){
                        console.log(err);
                        res.status(500).json({err : db_err});
                    } else {
                        jwt.sign({username : req.body.username},SECRET,(err,token) => {
                                if(err){
                                    res.status(500).json({err : "A server error occurred."});
                                    return;
                                } 
                            res.status(200).json({token});
                        })
                    }
                });
            } else {
                console.log(dbres);
                res.status(401).json({err : "User already exists, please select a different username."});
            }
        }
    });
})

app.post('/createTodo', CORS(LH3,'POST','Authorization, Content-Type'), AUTH, (req,res,next) => {
    console.log("CREATING!", req.body.todo);
    const todo = {...req.body.todo};

    const tempTodoModel = new todoModel(); 
    tempTodoModel.UNAME = req.username;
    tempTodoModel.TODOID = uuid.v1();
    tempTodoModel.TITLE = todo.title;
    tempTodoModel.DONE = 'N';
    tempTodoModel.IMPORTANCE = todo.importance;
    tempTodoModel._MONTH = todo.month;
    tempTodoModel._YEAR = todo.year;
    tempTodoModel._DAY = todo.day;
    tempTodoModel.save(dberr => {
        if(dberr){
            console.log(dberr);
            res.status(500).json({err : dberr});
        } else {
            console.log('successfully inserted...');
            res.status(200).json({data : "DONE"})
        }
    })
})

app.post('/getTodos', CORS(LH3,'POST','Authorization, Content-Type'), AUTH, (req,res,next) => {
    console.log("GET TODOS")
    const {body} = req;

    console.log(body.month, body.year);

    todoModel.find({
        UNAME : req.username,
        _MONTH : body.month + 1,
        _YEAR : body.year
    }, (dberr, dbres) => {
        if(dberr){
            console.log(dberr);
            res.status(500).json({err : dberr});
        } else {
            const resData = dbres.map(ele => ({
                TODOID : ele.TODOID,
                UNAME : ele.UNAME,
                _MONTH : ele._MONTH,
                _YEAR : ele._YEAR,
                _DAY : ele._DAY,
                TITLE : ele.TITLE,
                DONE : ele.DONE,
                IMPORTANCE : ele.IMPORTANCE
            }))
            res.status(200).json({data : resData})
        }
    })
})

app.delete('/deleteTodo', CORS(LH3, 'DELETE', 'Authorization, todo-id'), AUTH, (req,res,next) => {
    console.log('DELETION...');

    todoModel.deleteOne({TODOID : req.headers['todo-id']}, (dberr,dbres) => {
        console.log(dberr);
        console.log(dbres);
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

    todoModel.findOneAndUpdate({TODOID : todoID}, {DONE : actual}, (dberr, dbres) => {
        if(dberr){
            console.log(dberr);
            res.status(500).json({err : dberr});
        } else {
            res.status(200).json({success : true})
        } 
    })
})

if(process.env.NODE_ENV === 'PROD'){
    console.log("HERE")
    app.use(express.static('app/build'));
    app.get('*', (req,res) => { 
        res.sendFile(path.resolve(__dirname, 'app', 'build', 'index.html'));
    })
}

app.listen(port, () => {
    console.log(`listening@${port}`, process.env.PORT)
    console.log(process.env.NODE_ENV);
}) 