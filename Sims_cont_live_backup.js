const express=require('express');
var router=express.Router();
var mongoose=require('mongoose');
var multiparty = require('multiparty');
var  Sims =require('../models/sims_model');
var Users=require('../models/users');
var bcrypt=require('bcryptjs');
var ObjectId=require('mongoose').Types.ObjectId;
const passport= require('passport');
const jwt=require('jsonwebtoken');
const fs = require('fs');
const getStream = require('get-stream');
const parse = require('csv-parse');
const path  =require('path');
var secret="MySceret";
router.get('/',(req,res)=>{
 const queryParams = req.query;
         sortOrder = queryParams.sortOrder,
         filter = queryParams.filter,
         unqiuefilter=queryParams.uniquefilter,
         pageNumber = parseInt(queryParams.pageNumber) || 0,
         pageSize = parseInt(queryParams.pageSize);
         var query = {}
         if(pageNumber===0)
         {
           query.skip=0;
           query.limit=pageSize;
         }
         else {
           query.skip=pageSize *(pageNumber-1);
           query.limit=pageSize;
         }
         if(unqiuefilter!="")
         {
           try {
             var q=Sims.find({msisdn:unqiuefilter}).skip(query.skip).limit(query.limit);
             q.exec((err,data)=>{
               if(!err)
               {
               //console.log(unqiuefilter);
               console.log(data);
               res.send(data);
               }
               else {
                 res.send(err);
               }
             })
           } catch (e) {
             console.log(e);
           }
         }
         else{
         if(filter=='')
         {
var query = Sims.find({}).skip(query.skip).limit(query.limit);
query.exec((err,data)=>{
  res.send(data);
});
}else {
  try
{
  var q=Sims.find({company_name:{ '$regex' : filter, '$options' : 'i' } }).skip(query.skip).limit(query.limit);
  q.exec((err,data)=>{
    if(!err)
    {
    res.send(data);
    }
    else {
      res.send(err);
    }
  })
}
catch(e)
{
  console.log(e);
}
}
}
});


router.get('/getUserSpecificsims/',async (req,res)=>{
          const queryParams = req.query;
          sortOrder = queryParams.sortOrder,
          filter = queryParams.filter,
          unqiuefilter=queryParams.uniquefilter,
          pageNumber = parseInt(queryParams.pageNumber) || 0,
          pageSize = parseInt(queryParams.pageSize);
          cname=queryParams.cname;
          const names_arr=cname.split(",");
          var query = {}
          if(pageNumber===0)
          {
            query.skip=0;
            query.limit=pageSize;
          }
          else {
            query.skip=pageSize *(pageNumber-1);
            query.limit=pageSize;
          }
          if(unqiuefilter!="")
          {
            try {
              var q=Sims.find({$and:[{msisdn:unqiuefilter},{company_name:{$in:names_arr}}]}).skip(query.skip).limit(query.limit);
              q.exec((err,data)=>{
                if(!err)
                {
                //console.log(unqiuefilter);
                console.log(data);
                res.send(data);
                }
                else {
                  res.send(err);
                }
              })
            } catch (e) {
              console.log(e);
            }
          }
          else {
            if(filter=='')
            {
   var query = Sims.find({$and:[{},{company_name:{$in:names_arr}}]}).skip(query.skip).limit(query.limit);
   query.exec((err,data)=>{
     res.send(data);
   });
   }
   else {
     var q=Sims.find({$and:[{company_name:{ '$regex' : filter, '$options' : 'i' } },{company_name:{$in:names_arr}}]}).skip(query.skip).limit(query.limit);
     q.exec((err,data)=>{
       if(!err)
       {
       res.send(data);
       }
       else {
         res.send(err);
       }
     })
   }
          }
})


router.get('/getAllSimsCount',(req,res,next)=>{
Sims.countDocuments({},(err,count)=>{
  if(!err)
  {
    res.send({count:count});
  }
})
});



router.post('/addnewSim',(req,res)=>{
  sim =new Sims({
    msisdn:req.body.msisdn,
    account_number:req.body.account_number,
    company_name:req.body.company_name,
    customer_id:req.body.customer_id,
    status:req.body.status,
    cr_date:req.body.cr_date
  });
  sim.save((err,doc)=>{
    if(err)
    {
      res.send(err);
      //res.send({'success':false});
    }
    else {
      res.send({'success':true});
    }
  });
});
async function saveall(docss,req,res)
{
  try {
    await Sims.collection.insertMany(docss);
    return res.send({success:true,'failed-message':'N/A'});
  } catch (e) {
    return res.send({success:false,'failed-message':'Duplicate MSISDN,Account Numbers Found In File'});
  }

}
router.post('/read_file',(req,res)=>{
  let form = new multiparty.Form();
  read_file(form,req,res);
});

 function read_file(form,req,res)
{
  docss=new Array();
  form.parse(req,(err,fields,files)=>{
  var parser=parse({delimiter:','},function(err,data){
    var all_custs=fields.cust.join();
    data.forEach(function(line){
      all_custs.split(',').forEach(async function(e){
     if(line[13]===e)
      {
    Users.find({comapny_name:e},(err,doc)=>{
      if(!err)
      {
      }
      });
      sim=new Sims({
          msisdn:line[2],
          account_number:line[3],
          company_name:line[13],
          customer_id:line[1],
          status:line[7],
          cr_date:line[9]
        });
        docss.push(sim);
      }
     });
     });
       saveall(docss,req,res);
  });
  var pathhhh=files.file[0].path;
  path.normalize(pathhhh);
  if(path.extname(files.file[0].originalFilename)=='.csv')
  {
  let rstream=fs.createReadStream(pathhhh).pipe(parser);
  }
  else {
    res.send({'success':false,'failed-message':'Only CSV Format Files Are Allowed'});
  }
});
}

router.get('/getSpecificSim/:id',(req,res)=>{
  token=req.headers['authorization'];
  let token2=token.split(' ');
  token=token2[1];
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
          Sims.find({_id:req.params.id},(err,docs)=>{
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



router.put('/updateSim/:id',(req,res)=>{
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
            let s={
              msisdn:req.body.msisdn,
              account_number:req.body.account_number,
              company_name:req.body.company_name,
              customer_id:req.body.customer_id,
              status:req.body.status,
            };
            Sims.findByIdAndUpdate(req.params.id,{$set :s},{new:false},(err,docs)=>{
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



router.get('/getMysims',async (req,res)=>{
  try
  {
  const names=req.query.name;
  const names_arr=names.split(",");
  const allSimsCount=[];
  for(i=0;i<names_arr.length;i++)
  {
    simsCount=await Sims.countDocuments({company_name:names_arr[i]});
    allSimsCount.push({name:names_arr[i],simCount:simsCount});
  }
  res.send(allSimsCount);
  }
  catch(e)
  {
    console.log(e);
  }
});

router.get('/getTopLines/',async(req,res)=>{
  try {
    const names=req.query.name;
    const names_arr=names.split(",");
    const allCollections=await mongoose.connection.db.listCollections().toArray();
    var collections_name = [];
    var allColNamesInDb=[];
    var allDates=[];
    var topDurationCustomers=[];
    for (var i=0; i<7; i++) {
        var d = await new Date();
        d.setDate(d.getDate() - i);
        collections_name.push('dailylogs'+d.format("{Y}{MM}{DD}"));
        allDates.push(d.format("{Y}/{MM}/{DD}"));
    }
    for(const allCol of allCollections)
    {
      allColNamesInDb.push(allCol.name);
    }
    const found=await allColNamesInDb.filter(value => -1 !== collections_name.indexOf(value));
    let fou=found.sort();
    let da=allDates.sort();
    for(const f of fou)
    {
    let index=fou.indexOf(f);
    var result1=await mongoose.connection.db.collection(f).aggregate([{$match:{'company_name':{$in:[names_arr[0],names_arr[1]]}}},{ $group : {_id:"$customer_msisdn", max_duration: { $sum : {'$toInt':'$duration'} },"company_name":{"$first":"$company_name"}}},{$sort:{max_duration:-1}},{$limit: 3}]).toArray();
    for(const r of result1)
    {
      topDurationCustomers.push(await {date:da[index],name:r.company_name,msisdn:r._id,max_duration:r.max_duration});
    }
  }
  res.send(topDurationCustomers);
  } catch (e) {
    console.log(e)
  }
});


router.get('/getTopLinesCost',async (req,res)=>{
  try {
    const names=req.query.name;
    const names_arr=names.split(",");
    const allCollections=await mongoose.connection.db.listCollections().toArray();
    var collections_name = [];
    var allColNamesInDb=[];
    var allDates=[];
    var topCostCustomers=[];
    for (var i=0; i<7; i++) {
        var d = await new Date();
        d.setDate(d.getDate() - i);
        collections_name.push('dailylogs'+d.format("{Y}{MM}{DD}"));
        allDates.push(d.format("{Y}/{MM}/{DD}"));
    }
    for(const allCol of allCollections)
    {
      allColNamesInDb.push(allCol.name);
    }
    const found=await allColNamesInDb.filter(value => -1 !== collections_name.indexOf(value));
    let fou=found.sort();
    let da=allDates.sort();
    for(const f of fou)
    {
    let index=fou.indexOf(f);
    var result1=await mongoose.connection.db.collection(f).aggregate([{$match:{'company_name':{$in:[names_arr[0],names_arr[1]]}}},{ $group : {_id:"$customer_msisdn", cost: { $sum : {'$toInt':'$cost'} },"company_name":{"$first":"$company_name"}}},{$sort:{cost:-1}},{$limit: 3}]).toArray();
    for(const r of result1)
    {
      topCostCustomers.push(await {date:da[index],name:r.company_name,msisdn:r._id,cost:r.cost});
    }
  }
  res.send(topCostCustomers);
  } catch (e) {

  }
})

router.get('/getMysimsStatus',async (req,res)=>{
  try {
    const names=req.query.name;
    const names_arr=names.split(",");
    result=await Sims.aggregate([{$match:{"company_name":{"$in":names_arr}}},{$group:{"_id":'$status',"myCount": { "$sum": 1 }}}]);
    res.send(result);
  } catch (e) {
    console.log(e)
  }
});


router.get('/getLastWeekCost',async (req,res)=>{
try {
  const names=req.query.name;
  const names_arr=names.split(",");
  const allCollections=await mongoose.connection.db.listCollections().toArray();
  var collections_name = [];
  var allColNamesInDb=[];
  var allDates=[];
  var topCostCustomers=[];
  for (var i=0; i<7; i++) {
      var d = await new Date();
      d.setDate(d.getDate() - i);
      collections_name.push('dailylogs'+d.format("{Y}{MM}{DD}"));
      allDates.push(d.format("{Y}/{MM}/{DD}"));
  }
  for(const allCol of allCollections)
  {
    allColNamesInDb.push(allCol.name);
  }
  const found=await allColNamesInDb.filter(value => -1 !== collections_name.indexOf(value));
  let fou=found.sort();
  let da=allDates.sort();
  for(const f of fou)
  {
  let index=fou.indexOf(f);
  var result1=await mongoose.connection.db.collection(f).aggregate([{$match:{'company_name':{$in:names_arr}}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$cost' } }}}]).toArray();
  for(const r of result1)
  {
    topCostCustomers.push(await {date:da[index],nettype:r._id,total:(r.total)/100});
  }
}
console.log(topCostCustomers);
res.send(topCostCustomers);
} catch (e) {
console.log(e);
}
});

router.get('/lastWeekCallCount',async (req,res)=>{
  try {
  const names=req.query.name;
  const names_arr=names.split(",").map(String);
  const allCollections=await mongoose.connection.db.listCollections().toArray();
  var collections_name = [];
  var allColNamesInDb=[];
  var allDates=[];
  var dateWiseTotalCalls=[];
  for (var i=0; i<7; i++) {
      var d = await new Date();
      d.setDate(d.getDate() - i);
      collections_name.push('dailylogs'+d.format("{Y}{MM}{DD}"));
      allDates.push(d.format("{Y}/{MM}/{DD}"));
  }
  for(const allCol of allCollections)
  {
    allColNamesInDb.push(allCol.name);
  }
  const found=await allColNamesInDb.filter(value => -1 !== collections_name.indexOf(value));
  let fou=found.sort();
  let da=allDates.sort();
  for(const f of fou)
  {
  let index=fou.indexOf(f);
  var countByNetwork=await mongoose.connection.db.collection(f).aggregate([{$match:{'company_name':{$in:names_arr}}},{$group:{"_id":'$company_name',"myCount": { "$sum": 1 }}}]).toArray();
  for(c of countByNetwork)
  {
  dateWiseTotalCalls.push(await {date:da[index],total:c.myCount})
  }
  }
  res.send(dateWiseTotalCalls);
}
catch(e)
{
  console.log(e);
}
})

router.get('/getClientsSimsCount',async (req,res)=>{
  try {
  let simCount = await mongoose.connection.db.collection('sims').aggregate([{$match:{"status":"ACTIVE"}},{$group:{"_id":'$company_name',"myCount": { "$sum": 1 }}},{ "$sort": { "myCount": -1 } },{ "$limit": 5 }]).toArray();
  res.status(200).send(simCount);
  } catch (e) {
    console.log(e);
  }
});


router.get('/getAllClientsSimsCount',async (req,res)=>{
  try {
  let simCount = await mongoose.connection.db.collection('sims').aggregate([{$match:{"status":"ACTIVE"}},{$group:{"_id":'$company_name',"myCount": { "$sum": 1 }}},{ "$sort": { "myCount": -1 } }]).toArray();
  res.status(200).send(simCount);
  } catch (e) {
    console.log(e);
  }
});
module.exports=router;
