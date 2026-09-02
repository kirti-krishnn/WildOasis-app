import mongoose from 'mongoose';

interface IGuest {
    fullName: string;
    email: string;
    nationality: string;
    nationalID: string;
    countryFlag: string;
}

const guestSchema = new mongoose.Schema<IGuest>({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value: string): boolean {
                // Simple email validation regex
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Please provide a valid email address.',
        },
    },
    nationality: {
        type: String,
        required: true,
        validate: {
            validator: function (value: string): boolean {
                // Simple nationality validation (only letters and spaces)
                return /^[a-zA-Z\s]+$/.test(value);
            },
            message: 'Please provide a valid nationality.',
        },
    },
    nationalID: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value: string): boolean {
                // Simple national ID validation (alphanumeric, 6-20 characters)
                return /^[a-zA-Z0-9]{6,20}$/.test(value);
            },
            message: 'Please provide a valid national ID.',
        },
    },
    countryFlag: {
        type: String,
        required: true,
    },
});

const Guest = mongoose.model<IGuest>('Guest', guestSchema);

export default Guest;

