const express=require('express');
var router=express.Router();
var  Rolem =require('../models/roles_model');
var bcrypt=require('bcryptjs');
var ObjectId=require('mongoose').Types.ObjectId;
router.get('/',(req,res)=>{
  const queryParams = req.query;
  let role=queryParams.role;
  if(role==='Mobilink')
  {
  Rolem.find({rolename:{$nin:["Admin"]}},(err,docs)=>{
    if(!err)
    {
      res.send(docs);
    }
    else
    {
     res.send(err);
    }
  })
  }
  else {
  Rolem.find((err,docs)=>{
  if(!err)
  {
    res.send(docs);
  }
  else
  {
   res.send(err);
  }
  });
}
});
router.post('/addnewrole',(req,res)=>{
var new_role= new Rolem({
    rolename:req.body.rolename
});
new_role.save((err,docs)=>{
  resp_obj={};
  if(err)
  {
    resp_obj['success']=false;
    resp_obj['message']=err;
    res.send(resp_obj);
  }
  else
  {
      resp_obj['success']=true;
      resp_obj['message']='Role Added';
      res.send(resp_obj);
  }

});
});
module.exports=router;
