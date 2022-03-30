import express from "express"
import Dish from "../models/dish.js"
import axios from "axios"
import hijri from "hijri"
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Navigator } = require("node-navigator");
const navigator = new Navigator();  

const router = express.Router();


const getPrayerTimes =  async () => {
    
    //prayerTimes
    var prayerTimes
     
    //Latitude et Longitude of current Position
     var latitude 
     var longitude 

     navigator.geolocation.getCurrentPosition((success, error) => {
        if (error){
            console.error(error);
        }
        else {
            latitude = success.latitude
            longitude = success.longitude
        }
    });
    

     //get the current date Hijri
     const year = hijri.convert(new Date(), 0).year

     //get prayerTimes using 1st calculation method
     await axios.get(`http://api.aladhan.com/v1/hijriCalendar?latitude=${latitude}&longitude=${longitude}&method=1&month=9&year=${year}`)
    .then((res) => {
        prayerTimes =  res.data.data
    })


    return prayerTimes

}


export const getDishes = async (req, res) => {
  try {
    
    //prayerTimes
    var prayerTimes

    var differenceBetweenAsrAndMaghrib

    //Latitude et Longitude of current Position
    var latitude 
    var longitude 

    navigator.geolocation.getCurrentPosition((success, error) => {
        if (error){
            console.error(error);
        }
        else {
            latitude = success.latitude
            longitude = success.longitude
        }
    });
    

    //get the current date Hijri
    const year = hijri.convert(new Date(), 0).year

    //queries
    const ingredient = req.query.ingredient;
    const day = req.query.day;

    // get All dishes from DataBase and filtred based on choosen ingredient
    const dishes = await Dish.find()
    const filtredDishes = dishes.filter(dish => dish.ingredients.includes(ingredient));

    if(filtredDishes.length == 0){
        return res.status(400).json({message : " Invalid Ingredient , Please enter a valid One "})
    }

    //get prayerTimes of Africa/Tunisia in month 4 , year 2022 using 1st calculation method
    await axios.get(`http://api.aladhan.com/v1/hijriCalendar?latitude=${latitude}&longitude=${longitude}&method=1&month=9&year=${year}`)
                .then((res) => {
                    prayerTimes =  res.data.data
                })


    // get specific day based on the choosen day
    const dayInRamadan = prayerTimes.filter((prayer) => prayer.date.gregorian.day == day)
   
    //Calculate minutes between Asr and Maghrib
    if(dayInRamadan.length == 0){
        return res.status(400).json({message : "Please enter a valid day between 01 and 30"})
    }else{
        const Asr = dayInRamadan[0].timings.Asr.substring(0,5)
        const Maghrib = dayInRamadan[0].timings.Maghrib.substring(0,5)
        var startTime = new Date(`${dayInRamadan[0].date.gregorian.date.replace("-","/")} ${Asr}`); 
        var endTime = new Date(`${dayInRamadan[0].date.gregorian.date.replace("-","/")} ${Maghrib}`);
        var difference = endTime.getTime() - startTime.getTime(); // This will give difference in milliseconds
        differenceBetweenAsrAndMaghrib = Math.round(difference / 60000)-15 // This will give difference in minutes
   }


filtredDishes.map((dish)=>{
    if(differenceBetweenAsrAndMaghrib-dish.duration >= 0){
        dish.cooktime = `${(differenceBetweenAsrAndMaghrib-dish.duration).toString()} minutes after Asr`
    }else{
        dish.cooktime = `${(dish.duration-differenceBetweenAsrAndMaghrib).toString()} minutes before Asr`
    }
})

const newfiltredDishes = filtredDishes.map(selectProps("name", "ingredients","cooktime"));

return res.status(200).json(newfiltredDishes);
  
} catch (error) {
    return res.status(404).json({ message: error.message });
  }
};



const selectProps = (...props) =>{
    return function(obj){
      const newObj = {};
      props.forEach(name =>{
        newObj[name] = obj[name];
      });
      
      return newObj;
    }
  }



  // The endpoint should respond with the dish which could be cooked after Asr :)
  export const suggest = async (req, res) => {
    try {
    //prayerTimes
    const prayerTimes = await getPrayerTimes()

    var differenceBetweenAsrAndMaghrib

    //queries
    const day = req.query.day;

    // get All dishes from DataBase and filtred based on choosen ingredient
    const dishes = await Dish.find()

    // get specific day based on the choosen day
    const dayInRamadan = prayerTimes.filter((prayer) => prayer.date.gregorian.day == day)
   
    //Calculate minutes between Asr and Maghrib
    if(dayInRamadan.length == 0){
        return res.status(400).json({message : "Please enter a valid day between 01 and 30"})
    }else{
        const Asr = dayInRamadan[0].timings.Asr.substring(0,5)
        const Maghrib = dayInRamadan[0].timings.Maghrib.substring(0,5)
        var startTime = new Date(`${dayInRamadan[0].date.gregorian.date.replace("-","/")} ${Asr}`); 
        var endTime = new Date(`${dayInRamadan[0].date.gregorian.date.replace("-","/")} ${Maghrib}`);
        var difference = endTime.getTime() - startTime.getTime(); // This will give difference in milliseconds
        differenceBetweenAsrAndMaghrib = Math.round(difference / 60000)-15 // This will give difference in minutes
   }


dishes.map((dish)=>{
    if(differenceBetweenAsrAndMaghrib-dish.duration >= 0){
        dish.cooktime = `${(differenceBetweenAsrAndMaghrib-dish.duration).toString()} minutes after Asr`
        return dish
    }
})

    const newfiltredDishes = dishes.map(selectProps("name", "ingredients","cooktime"));

    return res.status(200).json(newfiltredDishes);

} catch (error) {
            console.log(error)
        }
  }


  export default router;
