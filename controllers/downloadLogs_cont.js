const express=require('express');
var router=express.Router();
var bcrypt=require('bcryptjs');
var format=require('date.format');
var mongoose=require('mongoose');
var ObjectId=require('mongoose').Types.ObjectId;
const passport= require('passport');
const jwt=require('jsonwebtoken');
var Maggregate = require('maggregate');
var secret="MySceret";
//const { createReadStream, createWriteStream } = require('fs');
//const fs =require('fs');
//var excel = require('excel4node');
//const jsonCsv = require('json2csv').parse;
//const path  =require('path');
//var jsonexport = require('jsonexport');

/*router.get('/',async (req,res)=>{
let msisdn=[];
let event_id=[];
let event_datetime=[];
let cost=[];
let network_type=[];
let a_party=[];
let b_party=[];
let duration=[];
let packageplan=[];
let net_val=[];
let net_iden=[];
let c_name=[];
  try{
  let data= await mongoose.connection.db.collection(req.query.logs).find({company_name:req.query.user}).toArray();
  if(data.length!=0)
  {
    for(var d of data)
    {
      c_name.push(d.company_name)
      msisdn.push(d.customer_msisdn);
      event_id.push(d.event_id);
      event_datetime.push(d.event_date_time);
      cost.push(d.cost);
      network_type.push(d.network_type);
      a_party.push(d.a_party_number);
      b_party.push(d.b_party_number);
      duration.push(d.duration);
      packageplan.push(d.package_plan);
      net_val.push(d.network_value);
      net_iden.push(d.network_identifier);

    }
  }
var workbook = new excel.Workbook();

// Add Worksheets to the workbook
var worksheet = workbook.addWorksheet('Sheet 1');

// Create a reusable style
var style = workbook.createStyle({
  font: {
    size: 12
  }
});
let filepath=path.join(__dirname,'../')+req.query.logs+'_'+req.query.user+'.xlsx';
workbook.write(req.query.logs+'.xlsx');
let headers=['Company Name','MSISDN','Event ID','Event Date Time','Cost( PKR )','Network Type','A Party Number','B Party Number','Duration( Sec )','Package Plan','Network Value','Network Identifier']
// Set value of cell A1 to 100 as a number type styled with paramaters of style
worksheet.column(1).setWidth(20)
worksheet.column(2).setWidth(20)
worksheet.column(4).setWidth(30)
worksheet.column(5).setWidth(20)
worksheet.column(6).setWidth(20)
worksheet.column(7).setWidth(20)
worksheet.column(8).setWidth(20)
worksheet.column(9).setWidth(30)
worksheet.column(10).setWidth(25)
worksheet.column(11).setWidth(25)
worksheet.column(11).setWidth(20)
for(var i=0;i<headers.length;i++)
{
worksheet.cell(1,i+1).string(headers[i]).style(style);
}
for(var j=0;j<msisdn.length;j++)
{
  let t=2;
  worksheet.cell(t+j,1).string(c_name[j]).style(style);
  worksheet.cell(t+j,2).string(msisdn[j]).style(style);
  worksheet.cell(t+j,3).string(event_id[j]).style(style);
  worksheet.cell(t+j,4).string(event_datetime[j]).style(style);
  worksheet.cell(t+j,5).string(cost[j]).style(style);
  worksheet.cell(t+j,6).string(network_type[j]).style(style);
  worksheet.cell(t+j,7).string(a_party[j]).style(style);
  worksheet.cell(t+j,8).string(b_party[j]).style(style);
  worksheet.cell(t+j,9).string(duration[j]).style(style);
  worksheet.cell(t+j,10).string(packageplan[j]).style(style);
  worksheet.cell(t+j,11).string(net_val[j]).style(style);
  worksheet.cell(t+j,12).string(net_iden[j]).style(style);


}
workbook.write(filepath,async(err,stats)=>{
  if(err)
  {
    console.error(err);
  }
  else {
    res.sendFile(filepath);
  }
});

}
catch(e)
{
  console.log(e);
}
})*/

router.get('/',async (req,res)=>{
  let opt=req.query.opt;

  let search_value=req.query.searchvalue;
  if(opt=='company')
  {
  var data= await mongoose.connection.db.collection(req.query.logs).find({company_name:search_value}).toArray();
  }
  else if(opt=='msisdn')
  {
  var data= await mongoose.connection.db.collection(req.query.logs).find({customer_msisdn:{ '$regex' : search_value, '$options' : 'i' }}).toArray();
  }
  else {
  var data= await mongoose.connection.db.collection(req.query.logs).find({customer_id:{ '$regex' : search_value, '$options' : 'i' }}).toArray();
  }
  for(d of data)
  {
    delete d._id;
    delete d.customer_id;
    delete d.event_life_cycle;
  }
  res.send(data);
});
module.exports=router;
