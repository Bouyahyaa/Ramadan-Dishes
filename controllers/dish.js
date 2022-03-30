import express from "express"
import Dish from "../models/dish.js"
import axios from "axios"
import hijri from "hijri"
import moment from "moment"

const router = express.Router();

export const getDishes = async (req, res) => {
    try {

        //queries
        const ingredient = req.query.ingredient;
        const day = req.query.day;

        if (!day || !ingredient) {
            res
                .status(404)
                .send(
                    "ingredient or a day must be missed. please enter the both of them"
                );
        }

        //day query refactor
        const rightDay = day.length == 1 ? "0" + day : day;

        //ingredient query refactor
        const rightIngredient = ingredient.toLowerCase().charAt(0).toUpperCase() + ingredient.slice(1).toLowerCase();

        //prayerTimes
        var prayerTimes

        var differenceBetweenAsrAndMaghrib

        //Latitude et Longitude of Africa/Tunis
        var latitude = 35.8245
        var longitude = 10.6346

        //get the current date Hijri
        const year = hijri.convert(new Date(), 0).year

        // get All dishes from DataBase and filtred based on choosen ingredient
        const dishes = await Dish.find()
        const filtredDishes = dishes.filter(dish => dish.ingredients.includes(rightIngredient));

        if (filtredDishes.length == 0) {
            return res.status(400).json({ message: " Invalid Ingredient , Please enter a valid One " })
        }

        //get prayerTimes of Africa/Tunisia in month 4 , year 2022 using 1st calculation method
        await axios.get(
            `http://api.aladhan.com/v1/hijriCalendar?latitude=${latitude.toString()}&longitude=${longitude.toString()}&method=1&month=9&year=${year}`
        ).then((res) => {
            prayerTimes = res.data.data
        })


        // get specific day based on the choosen day
        const dayInRamadan = prayerTimes.filter((prayer) => prayer.date.gregorian.day == rightDay)

        //Calculate minutes between Asr and Maghrib
        if (dayInRamadan.length == 0) {
            return res.status(400).json({ message: "Please enter a valid day between 01 and 30" })
        } else {
            const Asr = dayInRamadan[0].timings.Asr.substring(0, 5)
            const Maghrib = dayInRamadan[0].timings.Maghrib.substring(0, 5)
            const duration = moment
                .utc(
                    moment(Maghrib, "HH:mm:ss").diff(
                        moment(Asr, "HH:mm:ss")
                    )
                )
                .format("hh:mm:ss");
            differenceBetweenAsrAndMaghrib = moment.duration(duration).asMinutes() - 15;
        }


        filtredDishes.map((dish) => {
            if (differenceBetweenAsrAndMaghrib - dish.duration >= 0) {
                dish.cooktime = `${(differenceBetweenAsrAndMaghrib - dish.duration).toString()} minutes after Asr`
            } else {
                dish.cooktime = `${(dish.duration - differenceBetweenAsrAndMaghrib).toString()} minutes before Asr`
            }
        })

        const newfiltredDishes = filtredDishes.map(selectProps("name", "ingredients", "cooktime"));

        return res.status(200).json(newfiltredDishes);

    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
};



const selectProps = (...props) => {
    return function (obj) {
        const newObj = {};
        props.forEach(name => {
            newObj[name] = obj[name];
        });

        return newObj;
    }
}



// The endpoint should respond with random dish
export const suggest = async (req, res) => {
    try {
        
        var plats;
        const dishes = await Dish.find()

        var Allingredients = [];
        const day = req.query.day;
        if (!day) {
            res
                .status(404)
                .send("Enter a valid day number");
        } else if (parseInt(day) > 30 || parseInt(day) < 1 || isNaN(parseInt(day))) {

            res
                .status(404)
                .send(
                    "Enter a day number between 01 and 30 to suggest you a plat"
                );
        } else {
            //day query factoring
            dishes.map((plat) => {
                plat.ingredients.map(
                    (ingredient) =>
                        (Allingredients = [...Allingredients, ingredient])
                );
            });

           
            await axios
                .get(
                    `http://localhost:3000/cooktime?ingredient=${Allingredients[
                    Math.floor(Math.random() * Allingredients.length)
                    ]
                    }&day=${day}`
                )
                .then((res) => (plats = res.data));

            const plat = plats[Math.floor(Math.random() * plats.length)];

            res.status(200).send(plat);
        }

    } catch (error) {
        console.log(error)
    }
}


export default router;
