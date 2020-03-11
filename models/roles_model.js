const mongoose=require('mongoose');
const bcrypt  =require('bcryptjs');
var uniqueValidator = require('mongoose-unique-validator');
var roleSchema=new mongoose.Schema({
  rolename:{type:String,required:true,unique:true}
});
roleSchema.plugin(uniqueValidator);
mongoose.model('Role_model',roleSchema);
module.exports = mongoose.model('Role_model');
