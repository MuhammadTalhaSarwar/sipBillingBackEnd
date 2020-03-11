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

router.get('/fetch_reports',async(req,res)=>{
  try {
    const queryParams = req.query;
    fromDate=queryParams.from_date;
    toDate=queryParams.to_date;
    option=queryParams.option;
    filter_opt=queryParams.filter_option;
    selected_client=queryParams.selected_client;
    result=[];
    allColNamesInDb=[];
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
      allDates.push(d.format("{Y}/{MM}/{DD}"));
    }
    const allCollections=await mongoose.connection.db.listCollections().toArray();
    for(const allCol of allCollections)
    {
      allColNamesInDb.push(allCol.name);
    }
    const found=await allColNamesInDb.filter(value => -1 !== collections_name.indexOf(value));
    const fou=found.sort();
    let da=allDates.sort();
    if(filter_opt==='All Clients')
    {
    const names_arr=selected_client.split(",").map(String);
    if(option=='All GSM Calls')
    {
      for(const f of fou)
      {
        let index=fou.indexOf(f);
        const nettype=await mongoose.connection.db.collection(f).distinct('network_type');
        for(const n of nettype)
        {
          if(n=='GSM On-Net')
          {
          var countByNetwork=await mongoose.connection.db.collection(f).find({network_type:n}).toArray();
          if(countByNetwork.length>0)
          {
          result.push(await {date:da[index],netType:n,total:countByNetwork.length})
          }
          else {
          result.push(await {date:da[index],netType:n,total:0})
          }
          }
          else if(n=='Off-Net')
          {
          var countByNetwork=await mongoose.connection.db.collection(f).find({network_type:n}).toArray();
          if(countByNetwork>0)
          {
          result.push(await {date:da[index],netType:n,total:countByNetwork.length})
          }
          else {
          result.push(await {date:da[index],netType:n,total:0})
          }
          }
          else if(n=='On-Net')
          {
          var countByNetwork=await mongoose.connection.db.collection(f).find({network_type:n}).toArray();
          if(countByNetwork.length>0)
          {
            result.push(await {date:da[index],netType:n,total:countByNetwork.length})
          }
          else {
            result.push(await {date:da[index],netType:n,total:0})
          }
          }
        }

      }
      res.send(result);
    }
    else if(option=='All GSM Duration')
    {
      for(const f of fou)
      {
        let index=fou.indexOf(f);
        const nettype=await mongoose.connection.db.collection(f).distinct('network_type');
        for(const n of nettype)
        {
          if(n=='GSM On-Net')
          {
          var durationByNetwork=await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":n}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray();
          result.push(await {date:da[index],netType:n,duration:durationByNetwork[0].total/60})
          }
          else if(n=='Off-Net')
          {
          var durationByNetwork=await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":n}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray();
          result.push(await {date:da[index],netType:n,duration:durationByNetwork[0].total/60})
          }
          else if(n=='On-Net')
          {
          var durationByNetwork=await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":n}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray();
          result.push(await {date:da[index],netType:n,duration:durationByNetwork[0].total/60})
          }
        }
      }
      res.send(result);
    }
    else if (option=='All On Net Calls') {
      for(const f of fou)
      {
      let index=fou.indexOf(f);
      var onNetCount=await mongoose.connection.db.collection(f).find({network_type:'On-Net'}).toArray();
      result.push(await {date:da[index],netType:'On-Net',total:onNetCount.length})
      }
      res.send(result);
    }
    else if (option=='All Off Net Calls') {
      for(const f of fou)
      {
      let index=fou.indexOf(f);
      var offNetCount=await mongoose.connection.db.collection(f).find({network_type:'Off-Net'}).toArray();
      result.push(await {date:da[index],netType:'Off-Net',total:offNetCount.length})
      }
      res.send(result);
    }
    else if(option=='Intl.Call Count')
    {
      for(const f of fou)
      {
      let index=fou.indexOf(f);
      var offNetCount=await mongoose.connection.db.collection(f).find({network_type:"Int'l"}).toArray();
      console.log(offNetCount);
      result.push(await {date:da[index],netType:'inter',total:offNetCount.length})
      }
      res.send(result);
    }
    else if (option=='All GSM Minutes') {
      for(const f of fou)
      {
        let index=fou.indexOf(f);
        var sumByGsmNet= await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":'GSM On-Net'}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(Object.keys(sumByGsmNet).length>0)
        {
        result.push(await {date:da[index],netType:'GSM On-Net',total:Math.round(sumByGsmNet[0].total/60)})
        }
        else {
        result.push(await {date:da[index],netType:'GSM On-Net',total:0})
        }
        var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":'On-Net'}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(Object.keys(sumByonNet).length>0)
        {
        result.push(await {date:da[index],netType:'On-Net',total:Math.round(sumByonNet[0].total/60)})
        }
        else {
        result.push(await {date:da[index],netType:'On-Net',total:0})
        }
        var sumByoffNet= await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":'Off-Net'}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(Object.keys(sumByoffNet).length>0)
        {
        result.push(await {date:da[index],netType:'Off-Net',total:Math.round(sumByoffNet[0].total/60)})
        }
        else {
          result.push(await {date:da[index],netType:'Off-Net',total:0})
        }
      }
      res.send(result);
    }
    else if(option==='On-Net Minutes')
    {
      for(const f of fou)
      {
       let index=fou.indexOf(f);
       var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":'On-Net'}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
       if(Object.keys(sumByonNet).length>0)
       {
       result.push(await {date:da[index],netType:'On-Net',total:Math.round(sumByonNet[0].total/60)})
       }
       else {
       result.push(await {date:da[index],netType:'On-Net',total:0})
       }
      }
      res.send(result);
    }

    else if(option==='Off-Net Minutes')
    {
      for(const f of fou)
      {
       let index=fou.indexOf(f);
       var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":'Off-Net'}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
       if(Object.keys(sumByonNet).length>0)
       {
       result.push(await {date:da[index],netType:'Off-Net',total:Math.round(sumByonNet[0].total/60)})
       }
       else {
       result.push(await {date:da[index],netType:'Off-Net',total:0})
       }
      }
      res.send(result);
    }
    else if(option==='Intl.Minutes')
    {
      for(const f of fou)
      {
       let index=fou.indexOf(f);
       var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{"network_type":"Int'l"}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
       if(Object.keys(sumByonNet).length>0)
       {
       result.push(await {date:da[index],netType:'inter',total:Math.round(sumByonNet[0].total/60)})
       }
       else {
       result.push(await {date:da[index],netType:'inter',total:0})
       }
      }
      res.send(result);
    }
    else if (option=='Average Call Duration') {
      for(const f of fou)
      {
        let index=fou.indexOf(f);
        var countBy=await mongoose.connection.db.collection(f).countDocuments();
        var totalSum=await mongoose.connection.db.collection(f).aggregate([{$match:{}},{$group:{_id:"",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        result.push(await {date:da[index],total:(totalSum[0].total/60)/countBy});
      }
      res.send(result);
    }
    else if (option=='Total Minutes') {
      for(const f of fou)
      {
        let index=fou.indexOf(f);
        var totalSum=await mongoose.connection.db.collection(f).aggregate([{$match:{}},{$group:{_id:"",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        result.push(await {date:da[index],total:Math.round(totalSum[0].total/60)});
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
        let index=fou.indexOf(f);
        const nettype=await mongoose.connection.db.collection(f).distinct('network_type');
        for(const n of nettype)
        {
          if(n=='GSM On-Net')
          {
          var countByNetwork=await mongoose.connection.db.collection(f).find({$and:[{"company_name":selected_client},{"network_type":n}]}).toArray();
          if(countByNetwork.length>0)
          {
            result.push(await {date:da[index],netType:n,total:countByNetwork.length})
          }
          else
          {
          result.push(await {date:da[index],netType:n,total:0})
          }
          }
          else if(n=='Off-Net')
          {
          var countByNetwork=await mongoose.connection.db.collection(f).find({$and:[{"company_name":selected_client},{"network_type":n}]}).toArray();
          if(countByNetwork.length>0)
          {
          result.push(await {date:da[index],netType:n,total:countByNetwork.length})
          }
          else {
            result.push(await {date:da[index],netType:n,total:0})
          }
          }
          else if(n=='On-Net')
          {
          var countByNetwork=await mongoose.connection.db.collection(f).find({$and:[{"company_name":selected_client},{"network_type":n}]}).toArray();
          if(countByNetwork.length>0)
          {
          result.push(await {date:da[index],netType:n,total:countByNetwork.length})
          }
          }
          else {
          result.push(await {date:da[index],netType:n,total:0})
          }
        }

      }
      res.send(result);
    }

    else if(option=='All GSM Duration')
    {
      for(const f of fou)
      {
        let index=fou.indexOf(f);
        const nettype=await mongoose.connection.db.collection(f).distinct('network_type');
        for(const n of nettype)
        {
          if(n=='GSM On-Net')
          {
          var durationByNetwork=await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":n},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray();
          if(Object.keys(durationByNetwork).length>0)
          {
          result.push(await {date:da[index],netType:n,duration:durationByNetwork[0].total/60})
          }
          }
          else if(n=='Off-Net')
          {
          var durationByNetwork=await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":n},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray();
          if(Object.keys(durationByNetwork).length>0)
          {
          result.push(await {date:da[index],netType:n,duration:durationByNetwork[0].total/60})
          }
          }
          else if(n=='On-Net')
          {
          var durationByNetwork=await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":n},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray();
          if(Object.keys(durationByNetwork).length>0)
          {
          result.push(await {date:da[index],netType:n,duration:durationByNetwork[0].total/60})
          }
          }
        }
      }
      res.send(result);
    }

    else if (option=='All On Net Calls') {
      for(const f of fou)
      {
      let index=fou.indexOf(f);
      var onNetCount=await mongoose.connection.db.collection(f).find({$and:[{"company_name":selected_client},{"network_type":"On-Net"}]}).toArray();
      result.push(await {date:da[index],netType:'On-Net',total:onNetCount.length})
      }
      res.send(result);
    }

    else if (option=='All Off Net Calls') {
      for(const f of fou)
      {
      let index=fou.indexOf(f);
      var offNetCount=await mongoose.connection.db.collection(f).find({$and:[{"company_name":selected_client},{"network_type":"Off-Net"}]}).toArray();
      result.push(await {date:da[index],netType:'Off-Net',total:offNetCount.length})
      }
      res.send(result);
    }

    else if(option=="Intl.Call Count")
    {
      for(const f of fou)
      {
      let index=fou.indexOf(f);
      var offNetCount=await mongoose.connection.db.collection(f).find({$and:[{"company_name":selected_client},{"network_type":"Int'l"}]}).toArray();
      result.push(await {date:da[index],netType:'inter',total:offNetCount.length})
      }
      res.send(result);
    }

    else if (option=='All GSM Minutes') {
      for(const f of fou)
      {
        let index=fou.indexOf(f);
        var sumByGsmNet= await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":"GSM On-Net"},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(Object.keys(sumByGsmNet).length>0)
        {
        result.push(await {date:f,netType:'GSM On-Net',total:Math.round(sumByGsmNet[0].total/60)})
        }
        else {
        result.push(await {date:f,netType:'GSM On-Net',total:0})
        }
        var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":"On-Net"},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(Object.keys(sumByonNet).length>0)
        {
        result.push(await {date:f,netType:'On-Net',total:Math.round(sumByonNet[0].total/60)})
        }
        else {
        result.push(await {date:f,netType:'On-Net',total:0})
        }
        var sumByoffNet= await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":"Off-Net"},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(Object.keys(sumByoffNet).length>0)
        {
        result.push(await {date:f,netType:'Off-Net',total:Math.round(sumByoffNet[0].total/60)})
        }
        else {
          result.push(await {date:f,netType:'Off-Net',total:0})

        }
      }
      res.send(result);
    }

    else if(option==='On-Net Minutes')
    {
      for(const f of fou)
      {
       let index=fou.indexOf(f);
       var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":"On-Net"},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
       if(Object.keys(sumByonNet).length>0)
       {
       result.push(await {date:da[index],netType:'On-Net',total:Math.round(sumByonNet[0].total/60)})
       }
       else {
       result.push(await {date:da[index],netType:'On-Net',total:0})
       }
      }
      res.send(result);
    }

    else if(option==='Off-Net Minutes')
    {
      for(const f of fou)
      {
       let index=fou.indexOf(f);
       var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":"Off-Net"},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
       if(Object.keys(sumByonNet).length>0)
       {
       result.push(await {date:da[index],netType:'Off-Net',total:Math.round(sumByonNet[0].total/60)})
       }
       else {
       result.push(await {date:da[index],netType:'Off-Net',total:0})
       }
      }
      res.send(result);
    }
    else if(option==='Intl.Minutes')
    {
      for(const f of fou)
      {
       let index=fou.indexOf(f);
       var sumByonNet= await mongoose.connection.db.collection(f).aggregate([{$match:{$and:[{"network_type":"Int'l"},{"company_name":selected_client}]}},{$group:{_id:"$network_type",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
       if(Object.keys(sumByonNet).length>0)
       {
       result.push(await {date:da[index],netType:'inter',total:Math.round(sumByonNet[0].total/60)})
       }
       else {
       result.push(await {date:da[index],netType:'inter',total:0})
       }
      }
      res.send(result);
    }

    else if (option=='Average Call Duration') {
      for(const f of fou)
      {
        let index=fou.indexOf(f);
        var countBy=await mongoose.connection.db.collection(f).countDocuments();
        var totalSum=await mongoose.connection.db.collection(f).aggregate([{$match:{"company_name":selected_client}},{$group:{_id:"",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(totalSum.length>0)
        {
        result.push(await {date:da[index],total:(totalSum[0].total/60)/countBy});
        }
        else {
        result.push(await {date:da[index],total:0});
        }
      }
      res.send(result);
    }

    else if (option=='Total Minutes') {
      for(const f of fou)
      {
        let index=fou.indexOf(f);
        var totalSum=await mongoose.connection.db.collection(f).aggregate([{$match:{"company_name":selected_client}},{$group:{_id:"",'total': { '$sum': { '$toInt': '$duration' } }}}]).toArray()
        if(totalSum.length>0)
        {
        result.push(await {date:da[index],total:Math.round(totalSum[0].total/60)});
        }
        else {
        result.push(await {date:da[index],total:0});
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
