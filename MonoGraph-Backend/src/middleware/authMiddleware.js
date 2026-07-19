import User from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const protect = catchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('You are not logged in. Please log in to continue.', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user linked to this token no longer exists.', 401));
    }

    req.user = currentUser;
    next();
});
