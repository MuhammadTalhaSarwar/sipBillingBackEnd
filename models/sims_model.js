const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
var uniqueValidator = require('mongoose-unique-validator');
var user=require('./users.js');
var simsSchema=new mongoose.Schema({
msisdn:{type:String,required:true, validate: {
                       validator: function(v) {
                           var re = new RegExp("^([0-9]+)$");
                           return (v == null || v.trim().length < 1) || re.test(v)
                       },
                       message: 'Invalid MSISDN Format.'
                   }},
 account_number:{ type:String,required:true,validate:{
                validator:function(v){
                  var re = new RegExp("^([-0-9]+)$");
                  return (v == null || v.trim().length < 1) || re.test(v)
                },
                message:'Invalid Account Number Format.'
                  }},
company_name:{type:String},
company_id:{type:String},
customer_id:{type:String,required:true,validate:{
              validator:function(v){
                var re = new RegExp("^([-A-Z a-z 0-9]+)$");
                return (v=null || v.trim().length<1) || re.test(v)
              },
              message:'Invalid customer_id Format'
}},
status:{type:String},
cr_date:{type:Date}
});


simsSchema.pre('save',function(next){
  var self=this;
user.find({company_name:this.company_name},(err,res)=>{
if(err)
{
  res.send({success:False,message:'No Such Company Found'});
}
else {
    if(res===undefined || res.length==0)
    {
      self.invalidate("company_id", "company_id must be unique");
      next(new Error("No Company ID Found"));
    }
    else {
      this.company_id=res[0]._id;
      next();
    }
}
});
});
mongoose.model('Sims',simsSchema);
module.exports = mongoose.model('Sims');
