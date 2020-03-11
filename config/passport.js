const JwtStrategy=require('passport-jwt').Strategy;
const ExtractJwt=require('passport-jwt').ExtractJwt;
const User=require('../models/users');
const config=require('../db');
var secret="MySceret";
module.exports=function(passport){
  var opts={}
  opts.jwtFromRequest=ExtractJwt.fromAuthHeaderWithScheme('jwt');
  opts.secret=secret;
  passport.use(new JwtStrategy(opts,(jwt_payload,done)=>{
    User.getUserById(jwt_payload.doc._id,(err,user)=>{
      if(err)
      {
        return done(err,false);
      }
      if(user)
      {
        return done(null,user);
      }
      else {
        return done(null,false);
      }
    });
  }))
}
