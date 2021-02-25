let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let dish_caloriesAndMacrosSchema = new Schema(
    {

        dishId: {
            type: Schema.Types.ObjectId,
            ref: 'dish'
        },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'restaurant'
        },
        isDeleted: { type: Number, default: 0 },
        fat: {
            fat: { type: Number },
            weight: { type: Number },
            fatUnit: { type: String, default: "g" }, // gm, etc

            totalFat: {
                weight: { type: Number },
                weightUnit: { type: String, default: "g" }, // gm, etc
                percentage: { type: Number }
            },
            saturatedFat: {
                weight: { type: Number },
                weightUnit: { type: String, default: "g" }, // gm, etc
                percentage: { type: Number }
            },
            transFat: {
                weight: { type: Number },
                weightUnit: { type: String, default: "g" }, // gm, etc
                percentage: { type: Number }
            },
            polyunsaturatedFat: {
                weight: { type: Number },
                weightUnit: { type: String, default: "g" }, // gm, etc
                percentage: { type: Number }
            },
            monounsaturatedFat: {
                weight: { type: Number },
                weightUnit: { type: String, default: "g" }, // gm, etc
                percentage: { type: Number }
            },
        },
        cholesterol: {
            name: { type: String },
            weight: { type: Number },
            weightUnit: { type: String, default: "g" }, // gm, etc
            percentage: { type: Number }
        },
        sodium: {
            name: { type: String },
            weight: { type: Number },
            weightUnit: { type: String, default: "g" }, // gm, etc
            percentage: { type: Number }
        },
        totalCarbohydrate: {
            name: { type: String },
            totalWeight: { type: Number },
            weightUnit: { type: String, default: "g" }, // gm, etc
            totalPercentage: { type: Number },
            dietaryFiber: {
                weight: { type: Number },
                weightUnit: { type: String, default: "g" }, // gm, etc
                percentage: { type: Number }
            },
            sugars: {
                weight: { type: Number },
                weightUnit: { type: String, default: "g" }, // gm, etc
                percentage: { type: Number }
            }
        },
        protien: {
            name: { type: String },
            totalWeight: { type: Number },
            weightUnit: { type: String, default: "g" }, // gm, etc
            totalPercentage: { type: Number },
            vitaminD: {
                weight: { type: Number },
                weightUnit: { type: String, default: "mg" }, // mg etc
                percentage: { type: Number }
            },
            calcium: {
                weight: { type: Number },
                weightUnit: { type: String, default: "mg" }, // mg etc
                percentage: { type: Number }
            },
            iron: {
                weight: { type: Number },
                weightUnit: { type: String, default: "mg" }, // mg etc
                percentage: { type: Number }
            },
            potassium: {
                weight: { type: Number },
                weightUnit: { type: String, default: "mg" }, // mg etc
                percentage: { type: Number }
            },
            vitaminA: {
                weight: { type: Number },
                weightUnit: { type: String, default: "IU" }, // IU etc
                percentage: { type: Number }
            },
            vitaminC: {
                weight: { type: Number },
                weightUnit: { type: String, default: "mg" }, // mg etc
                percentage: { type: Number }
            }
        },
        total: { type: Number }
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });




const Dish_caloriesAndMacrosModel = mongoose.model('dish_caloriesandmacros', dish_caloriesAndMacrosSchema);

module.exports = Dish_caloriesAndMacrosModel;
