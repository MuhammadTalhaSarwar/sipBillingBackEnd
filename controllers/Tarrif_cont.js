const express=require('express');
var router=express.Router();
var  TarrifModel =require('../models/tarrif_model');
var bcrypt=require('bcryptjs');
var ObjectId=require('mongoose').Types.ObjectId;
const passport= require('passport');
const jwt=require('jsonwebtoken');
var secret="MySceret";
router.get('/',(req,res)=>{
  token=req.headers['authorization'];
  if(token)
  {
    jwt.verify(token,secret, function (err,decoded) {
      if(err)
      {
        res.json({tokenerr:'Invalid Token'});
      }
      else {
        TarrifModel.find((err,doc)=>{
          if(!err)
          {
            res.send(doc);
          }
          else {
            res.send({message:"failed to fetch tarrif"});
          }
        });
      }
    });
  }
  else {
    res.json({tokenerr:'Invalid Token'});
  }
});

router.post('/addnewtarrif',(req,res)=>{
  token=req.headers['authorization'];
  if(token)
  {
    jwt.verify(token,secret, function (err,decoded) {
      if(err)
      {
        res.json({tokenerr:'Invalid Token'});
      }
      else {
        var newTarrif= new TarrifModel({
          tarrif_name:req.body.terrif_name,
          tarrif_type:req.body.tarrif_type,
          pulse:req.body.pulse,
          on_net:req.body.on_net,
          off_net:req.body.off_net,
          line_rent:req.body.line_rent,
          freeAllowance:req.body.freeAllowance,
          added_by:req.body.added_by,
          added_on:req.body.added_on,
          modified_by:req.body.modified_by,
          modified_on:req.body.modified_on
        });
        newTarrif.save((err,docs)=>{
        if(err)
        {
          res.send(err);
        }
        else {
          res.send({success:'successfully added'});
        }
        });
      }
    });
  }
  else {
    res.json({tokenerr:'No Token Provided'});
  }

});

router.get('/terrifbytype',(req,res)=>{
  type=req.headers['type'];
  TarrifModel.find({tarrif_type:type},(err,doc)=>{
    if(!err)
    {
      res.send(doc);
    }
    else {
      res.send(err);
    }
  });
});


router.get('/getSpecificTarrif/:id',(req,res)=>{
  token=req.headers['authorization'];
  if(token!="" || token!=undefined)
  {
    jwt.verify(token,secret, function (err,decoded) {
      if(err)
      {
        res.json({tokenerr:'Invalid Token'});
      }
      else {
        if(!ObjectId.isValid(req.params.id))
        {
        res.status(400).send({id_err:'No Record Found With Given Id : '+(req.params.id)});
        }
        else {
          TarrifModel.find({_id:req.params.id},(err,docs)=>{
            if(!err)
            {
              res.send(docs);
            }
            else {
              res.send({fetch_err:err});
            }
          })
        }
      }
    });
  }
  else {
    res.send({tokenerr:'Verification Is Required'});
  }

});

router.put('/updateTarrif/:id',(req,res)=>{
  token=req.headers['authorization'];
  if(token!="" || token!=undefined)
  {
      jwt.verify(token,secret, function (err,decoded) {
        if(err)
        {
          res.json({tokenerr:'Invalid Token'});
        }
        else {
          if(!ObjectId.isValid(req.params.id))
          {
          res.status(400).send({id_err:'No Record Found With Given Id : '+(req.params.id)});
          }
          else {
            let t={
              tarrif_name:req.body.terrif_name,
              tarrif_type:req.body.tarrif_type,
              pulse:req.body.pulse,
              on_net:req.body.on_net,
              off_net:req.body.off_net,
              line_rent:req.body.line_rent,
              freeAllowance:req.body.freeAllowance,
              modified_by:req.body.modified_by,
              modified_on:req.body.modified_on
            };
            TarrifModel.findByIdAndUpdate(req.params.id,{$set :t},{new:false},(err,docs)=>{
              respo={};
              if(!err)
              {
                respo['success']=true;
                res.send(respo);
              }
              else {
                respo['success']=false;
                res.send(respo);
              }
            });
          }
        }
      });
  }

});

router.get('/compare_pass',(req,res)=>{
  res.send("ok");

})
module.exports=router;
