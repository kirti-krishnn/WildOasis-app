import mongoose from 'mongoose';

interface ICabin {
    name: string;
    maxCapacity: number;
    regularPrice: number;
    discount: number;
    image: string;
    description: string;
}

const cabinSchema = new mongoose.Schema<ICabin>({
    name: {
        type: String,
        required: true,
        unique: true, 
    },
    maxCapacity: {
        type: Number,
        required: true,
    },
    regularPrice: {
        type: Number,   
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
        validate: {
            validator: function (value: number): boolean {
                const cabin = this as unknown as ICabin;
                return value >= 0 && value <= cabin.regularPrice;    
            },
            message: 'Discount must be between 0 and the regular price.',
        },  
    },
    image: {
        type: String,
        required: true,
    },
    description: {  
        type: String,
        required: true,
    },
});


const Cabin = mongoose.model<ICabin>('Cabin', cabinSchema);

export default Cabin;


