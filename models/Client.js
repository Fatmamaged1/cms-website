const mongoose = require('mongoose');
const clientSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        maxlength:[200,'name cannot be more than 200 characters']
    },
    logo:{
        type:String,
        required:true,
        trim:true,
    },
    brief:{
        type:String,
        required:true,
        trim:true,
    },
    url:{
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
clientSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Client', clientSchema);