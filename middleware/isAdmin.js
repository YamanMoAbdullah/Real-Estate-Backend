const User = require('../models/user');

const isAdmin = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.user.id);

        if (currentUser.role === 'user') {
            return res.status(403).json({ message: 'Access denied: Only admins can add or update properties' });
        }

        next();
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

module.exports = isAdmin;
