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

router.get('/fetch_reports',async(req,res,next)=>{
  try {
    const queryParams = req.query;
    var fromDate=queryParams.from_date;
    var toDate=queryParams.to_date;
    var option=queryParams.option;
    var filter_opt=queryParams.filter_option;
    var selected_client=queryParams.selected_client;
    var result=[];
    var allColNamesInDb=[];
    var allDates=[];
    var collections_name = new Array();
    let fd=new Date(fromDate);
    let td= new Date(toDate);
    let timeDiff = Math.abs(fd.getTime() - td.getTime());
    let dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
    for (var i=0; i<=dayDifference; i++) {
      var d = new Date(fromDate);
      d.setDate(d.getDate() + i);
      collections_name.push('dailylogs'+d.format("{Y}{MM}{DD}"))
    }
    const allCollections=await mongoose.connection.db.listCollections().toArray();
    for(const allCol of allCollections)
    {
      allColNamesInDb.push(allCol.name);
    }
    const found=await allColNamesInDb.filter(value => -1 !== collections_name.indexOf(value));
    const fou=found.sort();
    if(filter_opt==='All Clients')
    {
    if(option=='All GSM Calls')
    {
      //const nettype=await mongoose.connection.db.collection(fou[0]).distinct('network_type');
      for(const f of fou)
      {
        let d=f.substr(9)
        var countByNetwork=await mongoose.connection.db.collection(f).countDocuments();
        result.push(await {date:d,netType:"GSM On-Net",total:countByNetwork})
        //const nettype=await mongoose.connection.db.collection(f).distinct('network_type');
        /*for(const n of nettype)
        {
          if(n=='GSM On-Net')
          {
          var countByNetwork=await mongoose.connection.db.collection(f).find({network_type:n},{_id:1}).toArray();
          if(countByNetwork.length>0)
          {
          result.push(await {date:d,netType:n,total:countByNetwork.length})
          }
          else {
          result.push(await {date:d,netType:n,total:0})
          }
          }
          else if(n=='Off-Net')
          {
          var countByNetwork=await mongoose.connection.db.collection(f).find({network_type:n},{_id:1}).toArray();
          if(countByNetwork.length>0)
          {
          result.push(await {date:d,netType:n,total:countByNetwork.length})
          }
          else {
          result.push(await {date:d,netType:n,total:0})
          }
          }
          else if(n=='On-Net')
          {
          var countByNetwork=await mongoose.connection.db.collection(f).find({network_type:n},{_id:1}).toArray();
          if(countByNetwork.length>0)
          {
            result.push(await {date:d,netType:n,total:countByNetwork.length})
          }
          else {
            result.push(await {date:d,netType:n,total:0})
          }
          }
        }*/

      }
      res.send(result);
      next();
    }
    else if(option=='All GSM Duration')
    {
      for(const f of fou)
      {
        let d=f.substr(9)
        const nettype=await mongoose.connection.db.collection(f).distinct('network_type');
        for(const n of nettype)
        {
          if(n=='GSM On-Net')
          {
          var durationByNetwork=await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":n}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray();
          result.push(await {date:d,netType:n,duration:durationByNetwork[0].total/60})
          }
          else if(n=='Off-Net')
          {
          var durationByNetwork=await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":n}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray();
          result.push(await {date:d,netType:n,duration:durationByNetwork[0].total/60})
          }
          else if(n=='On-Net')
          {
          var durationByNetwork=await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":n}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray();
          result.push(await {date:d,netType:n,duration:durationByNetwork[0].total/60})
          }
        }
      }
      res.send(result);
    }
    else if (option=='All On Net Calls') {
      for(const f of fou)
      {
      let d=f.substr(9)
      var onNetCount=await mongoose.connection.db.collection(f).find({network_type:'On-Net'}).toArray();
      result.push(await {date:d,netType:'On-Net',total:onNetCount.length})
      }
      res.send(result);
    }
    else if (option=='All Off Net Calls') {
      for(const f of fou)
      {
      let d=f.substr(9)
      var offNetCount=await mongoose.connection.db.collection(f).find({network_type:'Off-Net'}).toArray();
      result.push(await {date:d,netType:'Off-Net',total:offNetCount.length})
      }
      res.send(result);
    }
    else if(option=='Intl.Call Count')
    {
      for(const f of fou)
      {
      let d=f.substr(9)
      var offNetCount=await mongoose.connection.db.collection(f).find({network_type:"Int'l"}).toArray();
      result.push(await {date:d,netType:'inter',total:offNetCount.length})
      }
      res.send(result);
    }
    else if (option=='All GSM Minutes') {
      for(const f of fou)
      {
        let d=f.substr(9)
        var sumByGsmNet= await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":'GSM On-Net'}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(Object.keys(sumByGsmNet).length>0)
        {
        result.push(await {date:d,netType:'GSM On-Net',total:Math.round(sumByGsmNet[0].total/60)})
        }
        else {
        result.push(await {date:d,netType:'GSM On-Net',total:0})
        }
        var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":'On-Net'}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(Object.keys(sumByonNet).length>0)
        {
        result.push(await {date:d,netType:'On-Net',total:Math.round(sumByonNet[0].total/60)})
        }
        else {
        result.push(await {date:d,netType:'On-Net',total:0})
        }
        var sumByoffNet= await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":'Off-Net'}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(Object.keys(sumByoffNet).length>0)
        {
        result.push(await {date:d,netType:'Off-Net',total:Math.round(sumByoffNet[0].total/60)})
        }
        else {
          result.push(await {date:d,netType:'Off-Net',total:0})
        }
      }
      res.send(result);
    }
    else if(option==='On-Net Minutes')
    {
      for(const f of fou)
      {
       let d=f.substr(9)
       var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":'On-Net'}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
       if(Object.keys(sumByonNet).length>0)
       {
       result.push(await {date:d,netType:'On-Net',total:Math.round(sumByonNet[0].total/60)})
       }
       else {
       result.push(await {date:d,netType:'On-Net',total:0})
       }
      }
      res.send(result);
    }

    else if(option==='Off-Net Minutes')
    {
      for(const f of fou)
      {
       let d=f.substr(9)
       var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":'Off-Net'}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
       if(Object.keys(sumByonNet).length>0)
       {
       result.push(await {date:d,netType:'Off-Net',total:Math.round(sumByonNet[0].total/60)})
       }
       else {
       result.push(await {date:d,netType:'Off-Net',total:0})
       }
      }
      res.send(result);
    }
    else if(option==='Intl.Minutes')
    {
      for(const f of fou)
      {
       let d=f.substr(9)
       var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":"Int'l"}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
       if(Object.keys(sumByonNet).length>0)
       {
       result.push(await {date:d,netType:'inter',total:Math.round(sumByonNet[0].total/60)})
       }
       else {
       result.push(await {date:d,netType:'inter',total:0})
       }
      }
      res.send(result);
    }
    else if (option=='Average Call Duration') {
      for(const f of fou)
      {
        let d=f.substr(9)
        var countBy=await mongoose.connection.db.collection(f).countDocuments();
        var totalSum=await mongoose.connection.db.collection(f).aggregate([{$match:{}},{$group:{_id:"",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        result.push(await {date:d,total:(totalSum[0].total/60)/countBy});
      }
      res.send(result);
    }
    else if (option=='Total Minutes') {
      for(const f of fou)
      {
        let d=f.substr(9)
        var totalSum=await mongoose.connection.db.collection(f).aggregate([{$match:{}},{$group:{_id:"",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        result.push(await {date:d,total:Math.round(totalSum[0].total/60)});
      }
      res.send(result);
    }
  }
  else if(filter_opt==='Specific Client')
  {
    if(option=='All GSM Calls')
    {
      for(const f of fou)
      {
        let d=f.substr(9)
        var countByNetwork=await mongoose.connection.db.collection(f).find({$and:[{"company_name":selected_client}]}).toArray();
        result.push(await {date:d,netType:"GSM On-Net",total:countByNetwork.length})
        //const nettype=await mongoose.connection.db.collection(f).distinct('network_type');
        /*for(const n of nettype)
        {
          if(n=='GSM On-Net')
          {
          var countByNetwork=await mongoose.connection.db.collection(f).find({$and:[{"company_name":selected_client},{"network_type":n}]}).toArray();
          if(countByNetwork.length>0)
          {
            result.push(await {date:d,netType:n,total:countByNetwork.length})
          }
          else
          {
          result.push(await {date:d,netType:n,total:0})
          }
          }
          else if(n=='Off-Net')
          {
          var countByNetwork=await mongoose.connection.db.collection(f).find({$and:[{"company_name":selected_client},{"network_type":n}]}).toArray();
          if(countByNetwork.length>0)
          {
          result.push(await {date:d,netType:n,total:countByNetwork.length})
          }
          else {
            result.push(await {date:d,netType:n,total:0})
          }
          }
          else if(n=='On-Net')
          {
          var countByNetwork=await mongoose.connection.db.collection(f).find({$and:[{"company_name":selected_client},{"network_type":n}]}).toArray();
          if(countByNetwork.length>0)
          {
          result.push(await {date:d,netType:n,total:countByNetwork.length})
          }
          }
          else {
          result.push(await {date:d,netType:n,total:0})
          }
        }*/

      }
      res.send(result);
    }

    else if(option=='All GSM Duration')
    {
      for(const f of fou)
      {
        let d=f.substr(9)
        const nettype=await mongoose.connection.db.collection(f).distinct('network_type');
        for(const n of nettype)
        {
          if(n=='GSM On-Net')
          {
          var durationByNetwork=await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":n},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray();
          if(Object.keys(durationByNetwork).length>0)
          {
          result.push(await {date:d,netType:n,duration:durationByNetwork[0].total/60})
          }
          }
          else if(n=='Off-Net')
          {
          var durationByNetwork=await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":n},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray();
          if(Object.keys(durationByNetwork).length>0)
          {
          result.push(await {date:d,netType:n,duration:durationByNetwork[0].total/60})
          }
          }
          else if(n=='On-Net')
          {
          var durationByNetwork=await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":n},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray();
          if(Object.keys(durationByNetwork).length>0)
          {
          result.push(await {date:d,netType:n,duration:durationByNetwork[0].total/60})
          }
          }
        }
      }
      res.send(result);
    }

    else if (option=='All On Net Calls') {
      for(const f of fou)
      {
      let d=f.substr(9);
      var onNetCount=await mongoose.connection.db.collection(f).find({$and:[{"company_name":selected_client},{"network_type":"On-Net"}]}).toArray();
      result.push(await {date:d,netType:'On-Net',total:onNetCount.length})
      }
      res.send(result);
    }

    else if (option=='All Off Net Calls') {
      for(const f of fou)
      {
      let d=f.substr(9);
      var offNetCount=await mongoose.connection.db.collection(f).find({$and:[{"company_name":selected_client},{"network_type":"Off-Net"}]}).toArray();
      result.push(await {date:d,netType:'Off-Net',total:offNetCount.length})
      }
      res.send(result);
    }

    else if(option=="Intl.Call Count")
    {
      for(const f of fou)
      {
      let d=f.substr(9);
      var offNetCount=await mongoose.connection.db.collection(f).find({$and:[{"company_name":selected_client},{"network_type":"Int'l"}]}).toArray();
      result.push(await {date:d,netType:'inter',total:offNetCount.length})
      }
      res.send(result);
    }

    else if (option=='All GSM Minutes') {
      for(const f of fou)
      {
        let d=f.substr(9);
        var sumByGsmNet= await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":"GSM On-Net"},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(Object.keys(sumByGsmNet).length>0)
        {
        result.push(await {date:d,netType:'GSM On-Net',total:Math.round(sumByGsmNet[0].total/60)})
        }
        else {
        result.push(await {date:d,netType:'GSM On-Net',total:0})
        }
        var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":"On-Net"},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(Object.keys(sumByonNet).length>0)
        {
        result.push(await {date:d,netType:'On-Net',total:Math.round(sumByonNet[0].total/60)})
        }
        else {
        result.push(await {date:d,netType:'On-Net',total:0})
        }
        var sumByoffNet= await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":"Off-Net"},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(Object.keys(sumByoffNet).length>0)
        {
        result.push(await {date:d,netType:'Off-Net',total:Math.round(sumByoffNet[0].total/60)})
        }
        else {
          result.push(await {date:d,netType:'Off-Net',total:0})

        }
      }
      res.send(result);
    }

    else if(option==='On-Net Minutes')
    {
      for(const f of fou)
      {
       let d=f.substr(9);
       var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":"On-Net"},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
       if(Object.keys(sumByonNet).length>0)
       {
       result.push(await {date:d,netType:'On-Net',total:Math.round(sumByonNet[0].total/60)})
       }
       else {
       result.push(await {date:d,netType:'On-Net',total:0})
       }
      }
      res.send(result);
    }

    else if(option==='Off-Net Minutes')
    {
      for(const f of fou)
      {
       let d=f.substr(9);
       var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":"Off-Net"},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
       if(Object.keys(sumByonNet).length>0)
       {
       result.push(await {date:d,netType:'Off-Net',total:Math.round(sumByonNet[0].total/60)})
       }
       else {
       result.push(await {date:d,netType:'Off-Net',total:0})
       }
      }
      res.send(result);
    }
    else if(option==='Intl.Minutes')
    {
      for(const f of fou)
      {
       let d=f.substr(9);
       var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":"Int'l"},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
       if(Object.keys(sumByonNet).length>0)
       {
       result.push(await {date:d,netType:'inter',total:Math.round(sumByonNet[0].total/60)})
       }
       else {
       result.push(await {date:d,netType:'inter',total:0})
       }
      }
      res.send(result);
    }

    else if (option=='Average Call Duration') {
      for(const f of fou)
      {
        let d=f.substr(9);
        var countBy=await mongoose.connection.db.collection(f).countDocuments();
        var totalSum=await mongoose.connection.db.collection(f).aggregate([{$match:{"company_name":selected_client}},{$group:{_id:"",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(totalSum.length>0)
        {
        result.push(await {date:d,total:(totalSum[0].total/60)/countBy});
        }
        else {
        result.push(await {date:d,total:0});
        }
      }
      res.send(result);
    }

    else if (option=='Total Minutes') {
      for(const f of fou)
      {
        let d=f.substr(9);
        var totalSum=await mongoose.connection.db.collection(f).aggregate([{$match:{"company_name":selected_client}},{$group:{_id:"",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(totalSum.length>0)
        {
        result.push(await {date:d,total:Math.round(totalSum[0].total/60)});
        }
        else {
        result.push(await {date:d,total:0});
        }
      }
      res.send(result);
    }
  }
}
  catch(e)
  {
    console.log(e);
  }

})
module.exports=router;
