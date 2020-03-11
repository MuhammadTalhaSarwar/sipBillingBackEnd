const mongoose = require('mongoose');
const bcrypt =require('bcryptjs');
var userSchema=new mongoose.Schema({
  name:{type:String},
  username:{type:String},
  password:{type:String},
  role:{type:String},
  email:{type:String},
  company_name:{type:String},
  contact:{type:String},
  status:{type:String},
  address:{type:String},
  added_by:{type:String},
  added_on:{type:Date},
  city:{type:String},
  cust_type:{type:String},
  grandparent:{type:String},
  tarrif_type:{type:String},
  tarrif:{type:String},
  saltSecret:{type:String}
});
userSchema.pre('save',function(next){
bcrypt.genSalt(10,(err,salt)=>{
bcrypt.hash(this.password,salt,(err,hash)=>{
  this.password=hash;
  this.saltSecret=salt;
  next();
});
});
});

userSchema.pre('findByIdAndUpdate',function(next){
  bcrypt.genSalt(10,(err,salt)=>{
  bcrypt.hash(this.password,salt,(err,hash)=>{
    this.password=hash;
    this.saltSecret=salt;
    next();
  });
  });
});

userSchema.methods.getUserById=(id,callback)=>{
User.findById();
};

mongoose.model('User',userSchema);
module.exports = mongoose.model('User');
