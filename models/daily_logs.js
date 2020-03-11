const mongoose=require('mongoose');
const bcrypt  =require('bcryptjs');
dailyLogsSchema= new mongoose.Schema({
customer_id:String,
customer_msisdn:String,
event_date_time:String,
cost:String,
network_type:String
});
mongoose.model('Daily',dailyLogsSchema);
module.exports = mongoose.model('Daily');
