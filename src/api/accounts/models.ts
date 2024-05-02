import mongoose from 'mongoose';
const { Schema, connection } = mongoose;


const userSchema = new mongoose.Schema({
  programs:{
    type:[String],
    required:true,
    default:[]
  },

  courses:{
    type:[Schema.Types.Mixed],
    required:true,
    default:[]
  },
  username: {
    type: String,
    required: true,
    min: 3,
    unique: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true
  }

}, {
  timestamps: true
})

const accountDb = connection.useDb('account');
const Accounts = accountDb.model("Account", userSchema, 'accounts')
export { Accounts }