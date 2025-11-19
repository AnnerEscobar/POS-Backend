import mongoose from 'mongoose';
import * as argon2 from 'argon2';
import { UserSchema } from './src/users/schemas/user.schema';

async function main() {
    console.log('🌱 Seeding admin user...');

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pos';
    await mongoose.connect(mongoUri);

    const User = mongoose.model('User', UserSchema);

    const exists = await User.findOne({ email: 'admin@pos.com' });
    if (exists) {
        console.log('⚠️  Admin ya existe, abortando.');
        process.exit(0);
    }

    const hash = await argon2.hash('123456');

    await User.create({
        email: 'admin@pos.com',
        name: 'Administrador',
        passwordHash: hash,
        role: 'owner',
    });

    console.log('✅ Admin creado: admin@pos.com / 123456');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
