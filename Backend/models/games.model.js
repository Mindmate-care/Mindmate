import { Schema, model } from "mongoose";
const gameSchema = new Schema({
  id:{
    type: Number, 
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  description:{
    type:String,
    required:true,
  },
  link:{
    type:String,
    required:true,
  },
  category:{
    type:String,
    required:true,
  },
  duration:{
    type:String,  
    default:"10-15 mins",
  },
  difficulty:{
    type:String,  
    default:"Medium,",
  },
  imageUrl:{
    type:String,
    required:true,
  },
  howTo:{
    type:String,
  }

  
  
});
const Games = model("games", gameSchema);

export default Games;
