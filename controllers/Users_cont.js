const express=require('express');
var router=express.Router();
var  User =require('../models/users');
var bcrypt=require('bcryptjs');
var ObjectId=require('mongoose').Types.ObjectId;
const passport= require('passport');
const jwt=require('jsonwebtoken');
var secret="MySceret";
router.get('/',(req,res)=>{
  const queryParams = req.query;
  let role=queryParams.role;
  if(role==='Mobilink')
  {
    User.find({role:{$nin:["Admin"]}},(err,docs)=>{
    if(!err)
    {
      res.send(docs);
    }
    else
    {
     console.log("Error Retriving The Employees");
    }
  }).sort({company_name:'asc'});
  }
  else {
  User.find((err,docs)=>{
  if(!err)
  {
    res.send(docs);
  }
  else
  {
   console.log("Error Retriving The Employees");
  }
}).sort({company_name:'asc'});
}
});

router.post('/addnewuser',(req,res)=>{
  respo={};
var user= new User({
    name:req.body.name,
    username:req.body.username,
    password:req.body.password,
    role:req.body.role,
    email:req.body.email,
    city:req.body.city,
    company_name:req.body.company_name,
    contact:req.body.contact,
    status:req.body.status,
    added_by:req.body.added_by,
    added_on:req.body.added_on,
    address:req.body.address,
    cust_type:req.body.cust_type,
    grandparent:req.body.grandparent,
    tarrif_type:req.body.tarrif_type,
    tarrif:req.body.tarrif,
});
console.log(req.body.password);
user.save((err,docs)=>{
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
//test addnewuser
router.post('/testaddnewuser',(req,res)=>{
  var error=false;
  error_msg=[];
  error_obj={};
  if(req.body.username=='')
  {
    error_msg.push('Username Is Required');
    error_obj['msg']='failed';
    error_obj['error']=error_msg;
    error=true;
  }
  if(req.body.name=='')
  {
    error_msg.push('Name Is Required');
    error_obj['msg']='failed';
    error_obj['error']=error_msg;
    error=true;
  }
  if(req.body.password=='')
  {
    error_msg.push('Password Is Required');
    error_obj['msg']='failed';
    error_obj['error']=error_msg;
    error=true;
  }
  if(req.body.email=='')
  {
    error_msg.push('Email Is Required');
    error_obj['msg']='failed';
    error_obj['error']=error_msg;
    error=true;
  }
  if(req.body.role=='')
  {
    error_msg.push('Role Is Required');
    error_obj['msg']='failed';
    error_obj['error']=error_msg;
    error=true;
  }
  if(error==true)
  {
    res.json(error_obj);
  }
  else {
var user= new User({
    name:req.body.name,
    username:req.body.username,
    password:req.body.password,
    role:req.body.role,
    email:req.body.email,
    company_name:req.body.company_name,
});
user.save((err,docs)=>{
  if(err)
  {
    console.log('Error Inserting The Data');
  }
  else {
    res.send(docs);
  }
});
}
/*user.save((err,docs)=>{
  if(err)
  {
    console.log('Error Inserting The Data');
  }
  else {
    res.send(docs);
  }
});*/
});

router.get('/getAllgps',(req,res)=>{
  User.find({cust_type:'grandparent'},(err,doc)=>{
    if(!err)
    {
      res.send(doc);
    }
    else {
      res.send(err);
    }
  });
});

router.get('/getAllActiveCustomers',(req,res)=>{
  User.find({role:'Customer',status:'Active',cust_type:'parent'},(err,doc)=>{
    if(!err)
    {
      res.send(doc);
    }
    else {
      res.send(err);
    }
  }).sort({company_name:'asc'});
});

router.get('/getUsername/:id',(req,res)=>{
  User.findById(req.params.id,(err,doc)=>{
    if(!err)
    {
      res.send(doc);
    }
    else {
      res.send(err);
    }
  });
});

router.get('/edituser/:id',(req,res)=>{
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send('No Record Found With Given Id : '+(req.params.id));
  }
  else {
  User.findById(req.params.id,(err,docs)=>{
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

router.put('/updateUser/:id',(req,res)=>{
  if(!ObjectId.isValid(req.params.id))
  {
  return res.status(400).send('No Record Found With Given Id : '+(req.params.id));
  }
  else
  {
  var user={
    name:req.body.name,
    username:req.body.username,
    role:req.body.role,
    email:req.body.email,
    city:req.body.city,
    company_name:req.body.company_name,
    contact:req.body.contact,
    status:req.body.status,
    address:req.body.address,
    cust_type:req.body.cust_type,
    grandparent:req.body.grandparent,
    tarrif_type:req.body.tarrif_type,
    tarrif:req.body.tarrif,
  };
  User.findByIdAndUpdate(req.params.id,{$set :user},{new:false},(err,docs)=>{
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
});

router.delete('/deleteusr/:id',(req,res)=>{
  if(!ObjectId.isValid(req.params.id))
  {
  return res.status(400).send('No Record Found With Given Id : '+(req.params.id));
  }
  else {
    User.findOneAndDelete(req.params.id,(err,doc)=>{
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

router.post('/login',(req,res)=>{
  if(!req.body.email)
  {
    res.json({'success':false,"message":"Enter Username"});
  }
  else {
  if(!req.body.password)
  {
    res.json({'success':false,"message":"Enter Password"});
  }
  else {
    User.findOne({username:req.body.email},(err,user)=>{
      if(err)
      {
        res.json({'success':false,"message":"Username Invalid"});
      }
      else {
        if(!user)
        {
          res.json({'success':false,"message":"Username Not Found"});
        }
        else {
          bcrypt.compare(req.body.password,user.password, function(err, response) {
            if(response===true)
            {
            const token=jwt.sign(user.toJSON(),secret,{expiresIn:9005754});
            res.json({success:true,'token':token,user:{id:user._id,name:user.name,username:user.username,role:user.role,email:user.email}})
            }
            else {

              res.json({'success':false,"message":"Password Dint match"});
            }
          });
        }

      }
    });
  }
}
});

router.get('/profile',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
  res.json({user:req.user});
});


router.get('/getAllactiveandttlclients',(req,res,next)=>{
  User.countDocuments({cust_type:'parent'},(err,docs)=>{
    res.send({count:docs});
  })
});


router.get('/getMyParents/:id',(req,res)=>{
  User.countDocuments({grandparent:req.params.id},(err,docs)=>{
    try
    {
    if(!err)
    {
      res.send({count:docs});
    }
    else {
      res.send(err);
    }
    }
    catch(e)
    {
      res.send(e);
    }
  })
});

router.get('/getMyParentsName/:id',(req,res)=>{
  User.find({grandparent:req.params.id},(err,docs)=>{
    try
    {
    if(!err)
    {
      res.send(docs);
    }
    else {
      res.send(err);
    }
    }
    catch(e)
    {
      res.send(e);
    }
  })
})

router.get('/compare_pass/',async (req,res)=>{
  const queryParams = req.query;
  const pass=queryParams.pass;
  const old_pass=queryParams.old_pass;
    bcrypt.compare(pass,old_pass, async function(err, response) {
      if(response===true)
      {
        res.send({matched:true});
      }
      else {

        res.send({notmatched:false});
      }
    })

})

router.put('/updatePassword/:id',async (req,res)=>{
  let salt=await bcrypt.genSalt(10);
  let hash=await bcrypt.hash(req.body.pass,salt);
  let user={
    password:hash,
    saltSecret:salt
  }
User.findByIdAndUpdate(req.params.id,{$set :user},{new:false},(err,docs)=>{
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
})

module.exports=router;
