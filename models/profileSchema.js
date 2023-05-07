import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
    userID: { type: String, require: true, unique: true },
    username: { type: String, require: true },
    serverID: { type: String, require: true }
}
);

const model = mongoose.model('users', profileSchema);

export default model;