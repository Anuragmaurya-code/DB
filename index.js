import mongoose from "mongoose";
import data from "./data.js"
import { config } from 'dotenv';
import { OpenAIApi, Configuration } from 'openai';
config();

mongoose.connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(console.log("connected successfully"))
    .catch(err => console.log("error"));



const openAi = new OpenAIApi(
    new Configuration({
        apiKey: process.env.API_KEY
    }));


const districtSchema = new mongoose.Schema({
    name: String,
    soilName: String,
});

const District = mongoose.model("district", districtSchema);


const states=Object.keys(data);
console.log(states);

import  Bottleneck from 'bottleneck';
const limiter = new Bottleneck({
  maxConcurrent: 1, // number of concurrent requests
  minTime: 20000, // minimum time to wait between requests (in milliseconds)
});

states.forEach(state => {
  data[state].forEach(district => {
    limiter.schedule(async () => { // use the rate limiter to schedule the async function
      try {
        const soilAnswer = await openAi.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "what is the major soil type in "+district+" district in india and options are forest,arid,black,laterite,alluvial,red and yellow. answer in one word only or else you die" }],
        });
        console.log(district);
        console.log(soilAnswer.data.choices[0].message.content);
        const Soil = soilAnswer.data.choices[0].message.content;
    
        const one = new District({
          name: district,
          soilName: Soil,
        });
        one.save()
          .then(console.log("Saved"))
          .catch(console.error);
      } catch (err) {
        console.error(err);
      }
    });
  });
});


// states.forEach(state => {
//     data[state].forEach(district => {
//         try {
//             async function myfunct() {
//                 const soilAnswer = await openAi.createChatCompletion({
//                     model: "gpt-3.5-turbo",
//                     messages: [{ role: "user", content: "Alluvial Soil,Black Cotton Soil,Red & Yellow Soil,Laterite Soil,Mountainous or Forest Soil,Arid or Desert Soil,Saline and Alkaline Soil,Peaty and Marshy Soil out of this options what is the soil type in " + district + ". Answer upto 4 word only" }],
//                 })
//                 await console.log(soilAnswer.data.choices[0].message.content)
//                 var Soil = await soilAnswer.data.choices[0].message.content;
    
//                 const one = new District({
//                     name: district,
//                     soilName: Soil,
//                 });
//                 one.save()
//                     .then(console.log("Saved"))
//                     .catch(console.error);
//             }
//             myfunct();
//         } catch {
//             res.send("something went wrong");
//         }
//     })
// });

