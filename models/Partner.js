const mongoose = require('mongoose');
const partnerSchema = new mongoose.Schema({
    
    name:{
        type:String,
        required:true,
        trim:true,
        maxlength:[200,'name cannot be more than 200 characters']
    },
    slug:{
        type:String,
        required:true,
        trim:true,
        index:true,
        unique:true
    },
    url:{
        type:String,
        required:false,
        trim:true,
    },
    logo:{
        type:String,
        required:true,
        trim:true,
    },
    brief:{
        type:String,
        required:false,
        trim:true,
    },
    services:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required:false
      }],    
})
partnerSchema.index({ slug: 1, name: 1 ,required: true}, { unique: true });
module.exports = mongoose.model('Partner', partnerSchema);


