const express=require('express');
var router=express.Router();
var { Employee } =require('../models/employee');
var ObjectId=require('mongoose').Types.ObjectId;
router.get('/',(req,res)=>{
  Employee.find((err,docs)=>{
  if(!err)
  {
    res.send(docs);
  }
  else
  {
   console.log("Error Retriving The Employees");
  }
  });
});

router.post('/addnewempl',(req,res)=>{
var emp= new Employee({
    name:req.body.name,
    position:req.body.position
});
emp.save((err,docs)=>{
  if(err)
  {
    console.log('Error Inserting The Data');
  }
  else {
    res.send(docs);
  }
});
});

router.get('/:id',(req,res)=>{
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send('No Record Found With Given Id : '+(req.params.id));
  }
  else {
  Employee.findById(req.params.id,(err,docs)=>{
    if(!err)
    {
      res.send(docs);
    }
    else {
      console.log('Error Retriving The Employee');
    }
  });
  }
});


router.put('/updateEmployee/:id',(req,res)=>{
  if(!ObjectId.isValid(req.params.id))
  {
  return res.status(400).send('No Record Found With Given Id : '+(req.params.id));
  }
  else
  {
  var emp={
    name:req.body.name,
    position:req.body.position
  };
  Employee.findByIdAndUpdate(req.params.id,{$set :emp},{new:false},(err,docs)=>{
    if(!err)
    {
      res.send(docs);
    }
    else {
      console.log('Error Updating The Employee');
    }
  });
  }
});

router.delete('/deleteemp/:id',(req,res)=>{
  if(!ObjectId.isValid(req.params.id))
  {
  return res.status(400).send('No Record Found With Given Id : '+(req.params.id));
  }
  else {
    Employee.findOneAndDelete(req.params.id,(err,doc)=>{
    if(!err)
    {
      res.send(doc);
    }
    else {
      console.log('Error Deleting The Employee');

    }
    });
  }
});
module.exports=router;
