let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let cuisine_typeSchema = new Schema(
    {
        name: { type: String, required: true },
        superAdminId: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        description: { type: String },
        image: { type: String },
        isDeleted: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }    /**active, inactive */
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const Cuisine_typeModel = mongoose.model('cuisine_type', cuisine_typeSchema);

module.exports = Cuisine_typeModel;