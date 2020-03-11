const express=require('express');
const bodyparser=require('body-parser');
const { mongoose }=require('./db.js');
var employeeCont=require('./controllers/Empl_cont.js');
var usersCont=require('./controllers/Users_cont.js');
var rolesCont=require('./controllers/Roles_cont.js');
var customerIdCont=require('./controllers/CustomerId_cont.js');
var Dashboardcont=require('./controllers/dashboard_cont.js');
var TarrifCont=require('./controllers/Tarrif_cont.js');
var SimsCont=require('./controllers/Sims_cont.js');
var reportsCont=require('./controllers/reports.js');
var downloadLogsCont=require('./controllers/downloadLogs_cont.js');
const helmet=require('helmet');
const cors=require('cors');
const url="/fixedvoiceapi"
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
let workers = [];
if (cluster.isMaster) {
  masterProcess();
} else {
  childProcess();
}
function masterProcess() {
  //console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    //console.log(`Forking process number ${i}...`);

    const worker = cluster.fork();
    workers.push(worker);

    // Listen for messages from worker
  }
}
  function childProcess()
  {
var app=express();
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.frameguard());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(cors({origin:'*'}));
app.listen(8000,'0.0.0.0',()=>console.log());
app.use('/employee',employeeCont);
app.use('/users',usersCont);
app.use('/roles',rolesCont);
app.use('/cids',customerIdCont);
app.use('/tarrif',TarrifCont);
app.use('/sims',SimsCont);
app.use('/admin_dash',Dashboardcont);
app.use('/reports',reportsCont);
app.use('/downloadLogs',downloadLogsCont);
}
