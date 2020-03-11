const express=require('express');
var router=express.Router();
const IncomingForm = require('formidable').IncomingForm;
var multiparty = require('multiparty');
var  CustomerId =require('../models/customer_id');
var bcrypt=require('bcryptjs');
var ObjectId=require('mongoose').Types.ObjectId;
const passport= require('passport');
const jwt=require('jsonwebtoken');
const fs = require('fs');
const getStream = require('get-stream');
const parse = require('csv-parse');
const path  =require('path');
//var async = require('async');
var secret="MySceret";
router.get('/',(req,res)=>{
  CustomerId.find((err,docs)=>{
  if(!err)
  {
    res.send(docs);
  }
  else
  {
   console.log("Error Retriving The CustomerIds");
  }
});
});
router.get('/:id',(req,res)=>{
  token=req.headers['authorization'];
  if(token)
  {
  jwt.verify(token,secret, function (err,decoded) {
    if(err)
    {
      res.json({message:'Invalid Token'});
    }
    else {
      CustomerId.find({company_id:req.params.id},(err,docs)=>{
      if(!err)
      {
        res.send(docs);
      }
      else
      {
       console.log("Error Retriving The CustomerIds");
      }
      });
    }
});//verify
  }
  else {
    res.json({message:'No Token Found'});
  }

});


router.get('/findbycname/:val',(req,res)=>{
  token=req.headers['authorization'];
  if(token)
  {
    jwt.verify(token,secret, function (err,decoded) {
      if(err)
      {
        res.json({message:'Invalid Token'});
      }
      else {
        CustomerId.find({company_name:req.params.val},(err,docs)=>{
        if(!err)
        {
          res.send(docs);
        }
        else
        {
         console.log("Error Retriving The CustomerIds");
        }
        });
      }
  });
  }
  else {
    res.json({message:'No Token Found'});
  }

});

router.put('/updatecid/:id',(req,res)=>{
  if(!ObjectId.isValid(req.params.id))
  {
  return res.status(400).send('No Record Found With Given Id : '+(req.params.id));
  }
  else {
    console.log(req.params.id);
    custIdObj={
      customer_id:req.body.customer_id,
      company_id:req.body.company_id
    };
    CustomerId.findByIdAndUpdate(req.params.id,{$set:custIdObj},{new:false},(err,doc)=>{
      respo={};
      if(err)
      {
       respo['success']=false;
       res.send(respo);
      }
      else {
        respo['success']=true;
        res.send(respo);
      }
    })
  }
});

router.post('/addcustomerid',(req,res)=>{
  respo={};
  custIdObj=new CustomerId({
    customer_id:req.body.customer_id,
    company_id:req.body.company_id
  });
  custIdObj.save((err,doc)=>{
    if(err)
    {
      respo['success']=false;
      res.send(respo);
    }
    else {
      respo['success']=true;
      res.send(respo);
    }
  });
});

router.post('/read_file',(req,res)=>{
let form = new multiparty.Form();
var respo=new Array();
form.parse(req,(err,fields,files)=>{
  //console.log(fields.cid.join());
  var parser=parse({delimiter:','},function(err,data){
   data.forEach(function(line){
      if(line[13]==fields.cname.join())
      {
        cust_id=line[1];
        respo.push(cust_id);
      }
    })
    var unique = respo.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
    respoo={};
    if(unique.length>0)
    {
    unique.forEach(function(rec){
      custIdObj=new CustomerId({
        customer_id:rec,
        company_id:fields.cid.join(),
        company_name:fields.cname.join()
      });
      custIdObj.save((err,doc)=>{
        if(!err)
        {
          respoo['success']=true;
          res.send(respoo);
        }
        else {
          respoo['success']=false;
          res.send(respoo);
        }
      })
    });
    }
    else {
      respoo['success']=false;
      respoo['failed-message']="No Company Found";
      res.send(respoo)
    }

  })
  var pathhhh=files.file[0].path;
  path.normalize(pathhhh);
  if(path.extname(files.file[0].originalFilename)=='.csv')
  {
  fs.createReadStream(pathhhh).pipe(parser);
  }
  else {
    res.send({'success':false,'failed-message':'Only CSV Format Files Are Allowed'});
  }
});
form.on('close',()=>{
  console.log("file form recieved");
})


});
module.exports=router;
