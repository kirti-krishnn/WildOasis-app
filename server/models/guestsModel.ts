import mongoose from 'mongoose';

interface IGuest {
    fullName: string;
    email: string;
    nationality?: string;
    nationalID?: string;
    countryFlag?: string;
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
        validate: {
            validator: function (value: string): boolean {
                if (!value) return true;
                // Simple nationality validation (only letters and spaces)
                return /^[a-zA-Z\s]+$/.test(value);
            },
            message: 'Please provide a valid nationality.',
        },
    },
    nationalID: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function (value: string): boolean {
                if (!value) return true;
                // Simple national ID validation (alphanumeric, 6-20 characters)
                return /^[a-zA-Z0-9]{6,20}$/.test(value);
            },
            message: 'Please provide a valid national ID.',
        },
    },
    countryFlag: {
        type: String,
    },
});

const Guest = mongoose.model<IGuest>('Guest', guestSchema);

export default Guest;

