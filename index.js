const express = require("express");
const app = express();
const ejs=require("ejs");
const path=require("path");
const mysql=require('mysql2');
const methodOverride = require("method-override");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extends:true}));
app.use(methodOverride('_method'))

const port = 8080;

let connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"achavda175",
    database:"tele"
});

app.get("/",(req,res)=>{
    res.render("index.ejs");
});

app.get("/teleweb/login",(req,res)=>{
    let repassed = false;
    res.render("login.ejs",{repassed});
});

app.get("/teleweb/register",(req,res)=>{
        let repassed=false;
        res.render("register.ejs",{repassed});
});

app.post("/teleweb/user",(req,res)=>{
    const {email,pass}=req.body;
    connection.query(`select * from teleuser where email='${email}'`,(err,result)=>{
        if(err){
            console.log("server choday gyu");
        }else{
            if(result.length == 0){
                let repassed = "user doesn't exist"
                res.render("login.ejs",{repassed})
            }else{
                let password = result[0].password;
                if(pass != password){
                    let repassed = "incorrect password";
                    res.render("login.ejs",{repassed})
                }else{
                    res.render("tele",{result});
                }
            }    
        }
    });
});

app.post("/teleweb/newUser",(req,res)=>{
    const {email,username,pass,repass}=req.body;
    if(req.body.pass == req.body.repass){
        let q=`insert into teleuser values(?,?,?)`;
        connection.query(q,[email,username,pass],(err,results)=>{
                let repassed = "failed to update database";
                if(err) res.render("register.ejs",{repassed});
                else res.redirect("/teleweb/login");
        });
    }else{
        let repassed = "password not matched";
        res.render("register.ejs",{repassed});
    }
});

app.get("/tele/:id/communicate",(req,res)=>{
    let email = req.params.id;
    res.render("communicate.ejs",{email});
});

app.get("/tele/:id/SeeMessages",(req,res)=>{
    let email = req.params.id;
    let q=`select * from messages where email='${email}'`;
    connection.query(q,(err,result)=>{
        if(err){
            console.log(err)
        }else{
            res.render("seeMessages.ejs",{result});
        }
    });
});

app.post("/tele/communicate/send",(req,res)=>{
    let {sender,reciver,message} = req.body;
    let q=`insert into messages(sender,email,message) values (?,?,?)`;

    connection.query(q,[sender,reciver,message],(err,results)=>{
        if(err) {res.send(`error in insertion ${err}`);
        }else{
            connection.query(`select * from teleuser where email='${sender}'`,(err,result)=>{
                if(err) {
                    res.send("error in redirecting")
                }else{
                    res.render("tele.ejs",{result});
                }
            });
        }
    });
});

app.delete("/tele/:id/:sender",(req,res)=>{
    let {id,sender} = req.params;
    let q=`delete from messages where email='${id}' and sender='${sender}'`;
    connection.query(q,(err,result)=>{
        if(err) throw err;
        else res.redirect(`/tele/${id}/SeeMessages`);
    });
});

app.listen(port,(req,res)=>{
    console.log(`Server is running on port ${port}`);
});