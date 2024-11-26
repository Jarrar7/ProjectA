import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.SECRET_KEY;

export default function ProtectedRoute({ children }) {
    const router = useRouter();

    const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

    if (!token) {
        router.push('/'); // Redirect to login if no token
        return null;
    }

    try {
        jwt.verify(token, SECRET_KEY);
        return children;
    } catch (err) {
        router.push('/'); // Redirect to login if token is invalid
        return null;
    }
}
