const express=require('express');
var router=express.Router();
var  User =require('../models/users');
var Tarrif=require('../models/tarrif_model');
var Sims =require('../models/sims_model');
var CustomerIds=require('../models/customer_id');
var Daily=require('../models/daily_logs');
var bcrypt=require('bcryptjs');
var format=require('date.format');
var mongoose=require('mongoose');
var ObjectId=require('mongoose').Types.ObjectId;
const passport= require('passport');
const jwt=require('jsonwebtoken');
var Maggregate = require('maggregate');
var secret="MySceret";
var ttl_parents;
router.get('/getAllactiveandttlclients',(req,res,next)=>{
  User.countDocuments({cust_type:'parent'},(err,docs)=>{
    ttl_parents=docs;
    res.send({count:docs});
  })
});

router.get('/getAllactivetarrifs',(req,res,next)=>{
Tarrif.countDocuments({},(err,docs)=>{
  res.send({count:docs});
})
});

router.get('/getAllActiveLines',(req,res,next)=>{
  Sims.countDocuments({},(err,docs)=>{
    res.send({count:docs});
  })
});


router.get('/getAllActiveCids',(req,res,next)=>{
  CustomerIds.countDocuments({},(err,docs)=>{
  res.send({count:docs});
  });
})



router.get('/getTarrifDetails',async (req,res)=>{
  try {
    final_res={};
  const allCollections=await mongoose.connection.db.listCollections().toArray();
  var collections_name = [];
  var allColNamesInDb=[];
  var allDates=[];
    for (var i=0; i<7; i++) {
        var d = await new Date();
        d.setDate(d.getDate() - i);
        collections_name.push('dailylogs'+d.format("{Y}{MM}{DD}"))
        allDates.push(d.format("{Y}/{MM}/{DD}"));
    }

    for(const allCol of allCollections)
    {
      allColNamesInDb.push(allCol.name);
    }

  const found=await allColNamesInDb.filter(value => -1 !== collections_name.indexOf(value));
  const not_found=await collections_name.filter(function(obj) { return found.indexOf(obj) == -1; });
  let fou=found.sort();
  let da=allDates.sort();
  //datewiseresult=[];
  dateWisenetwork=[];
  //var dailySchema=new mongoose.Schema({});
  for(const f of fou)
  {
    let index=fou.indexOf(f);
    const nettype=await mongoose.connection.db.collection(f).distinct('network_type');
    for(const n of nettype )
    {
      //[{$match:{"network_type":n}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$cost' } }}}]
      //var sumByNetType=await mongoose.model(f,dailySchema).aggregate([{$match:{"network_type":n}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$cost' } }}}]);
      var sumByNetType= await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":n}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$cost' } }}}]).toArray()
      for(const st of sumByNetType)
      {
      dateWisenetwork.push(await {date:da[index],nettype:n,total:(st.total/1000)})
      }


    }

  }
      res.send(dateWisenetwork);
  }
  catch(e)
  {
    console.log(e);
  }


});



router.get('/getTarrifD', async (req, res) => {
  try {
    const tarrifTypes = await Tarrif.find().distinct('tarrif_type');

    const tarrifCounters = {};
    let total = 0;
    for(const tarrifType of tarrifTypes) {
      const count = await User.count({tarrif_type: tarrifType});
      tarrifCounters[tarrifType] = count;
    }

    res.status(200).send(
      tarrifCounters);
  } catch(error) {
    res.status(500).send(error.message);
  }
});


router.get('/getNetworkWiseCallsCount',async (req,res)=>{
  try
  {
    const allCollections=await mongoose.connection.db.listCollections().toArray();
    var collections_name = [];
    var allColNamesInDb=[];
    var dateWiseTotalCalls=[];
      for (var i=0; i<7; i++) {
          var d = await new Date();
          d.setDate(d.getDate() - i);
          collections_name.push('dailylogs'+d.format("{Y}{MM}{DD}"))
      }

      for(const allCol of allCollections)
      {
        allColNamesInDb.push(allCol.name);
      }
  const found=await allColNamesInDb.filter(value => -1 !== collections_name.indexOf(value));
  const fou=found.sort();
  for(const f of fou)
  {
    var countByNetwork=await mongoose.connection.db.collection(f).countDocuments();

    dateWiseTotalCalls.push(await {date:f,total:countByNetwork})
  }

  res.send(dateWiseTotalCalls);

  }
  catch(e)
  {
    console.log(e);
  }
});


  router.get('/getNetworkWiseDurationCount',async (req,res)=>{
    try{
      const allCollections=await mongoose.connection.db.listCollections().toArray();
      var collections_name = [];
      var allColNamesInDb=[];
      var dateWisenetworkValue=[];
      for (var i=0; i<7; i++) {
          var d = await new Date();
          d.setDate(d.getDate() - i);
          collections_name.push('dailylogs'+d.format("{Y}{MM}{DD}"))
      }
      for(const allCol of allCollections)
      {
        allColNamesInDb.push(allCol.name);
      }
      const found=await allColNamesInDb.filter(value => -1 !== collections_name.indexOf(value));
      let fou=found.sort();
      for(const f of fou)
      {
        const nettype=await mongoose.connection.db.collection(f).distinct('network_value');
        for(const n of nettype )
        {
          var sumByNetValue= await mongoose.connection.db.collection(f).aggregate([{$match:{"network_value":n}},{$group:{_id:"network_value",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
          for(const st of sumByNetValue)
          {
          dateWisenetworkValue.push(await {date:f,net_value:n,total:st.total})
          }
        }
      }

      res.send(dateWisenetworkValue);

    }
    catch(e){
      console.log(e);
    }
  });


router.get('/getTopCustomers',async (req,res)=>{
try {
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
    var result1=await mongoose.connection.db.collection(f).aggregate([{ $group : {_id:"$company_name", max_duration: { $sum : {'$toInt':'$duration'} }}},{$sort:{max_duration:-1}},
      {$limit: 3}]).toArray();
      for(const r of result1)
      {
        topDurationCustomers.push(await {date:da[index],name:r._id,max_duration:r.max_duration});
      }

    }
    res.send(topDurationCustomers);
} catch (e) {
res.send(e);
}
});



router.get('/getTopEventsDaily',async (req,res)=>{
  try {
    const allCollections=await mongoose.connection.db.listCollections().toArray();
    var collections_name = [];
    var allColNamesInDb=[];
    var allDates=[];
    var topCustomersBasedOnEvents=[];
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
    var result1=await mongoose.connection.db.collection(f).aggregate([
    {
        $match: {
            company_name: { $not: {$size: 0} }
        }
    },
    { $unwind: "$company_name" },
    {
        $group: {
            _id: {'company_name':'$company_name'},
            count: { $sum: 1 }
        }
    },
    {
        $match: {
            count: { $gte: 2 }
        }
    },
    { $sort : { count : -1} },
    { $limit : 3 }
]).toArray();
for(resuuu of result1)
{
  resuuu['date']=da[index];
}
topCustomersBasedOnEvents.push(result1);
    }
    res.send(topCustomersBasedOnEvents);
  } catch (e) {
    console.log(e);
  }
});


module.exports=router;
