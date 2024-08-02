import mongoose from "mongoose"

export const conectDB = async(uri) => {
    try {
        mongoose.connect(uri)
    } catch (error) {
        console.log(error);
    }
}