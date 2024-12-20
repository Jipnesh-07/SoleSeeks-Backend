const Sneaker = require('../models/sneaker.model');

exports.createSneaker = async (req, res) => {
    const { title, description, price, brand, size, condition } = req.body;
    try {
       

        // Upload image and usdzFile to Cloudinary
        const imageUrls = req.files['image'] ? req.files['image'].map(file => file.path) : [];
        const usdzFileUrl = req.files['usdzFile'] ? req.files['usdzFile'][0].path : '';

        const sneaker = new Sneaker({
            title,
            description,
            price,
            brand,
            image: imageUrls,
            usdzFile: usdzFileUrl,
            size,
            condition,
            createdBy: req.user._id,
            isApproved: false // Sneaker needs admin approval
        });
        await sneaker.save();
        res.status(201).json({ sneaker });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



exports.approveSneaker = async (req, res) => {
    const { sneakerId } = req.params;
    const { isApprovedStatus } = req.body;

    try {
        const sneaker = await Sneaker.findById(sneakerId);
        if (!sneaker) return res.status(404).json({ message: 'Sneaker not found' });

        sneaker.isApproved = isApprovedStatus; // Admin approves the sneaker
        await sneaker.save();

        res.json({ message: 'Sneaker approved successfully', sneaker });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateSneaker = async (req, res) => {
    const { sneakerId } = req.params;
    const { title, description, price, brand, size, condition } = req.body;

    try {
        const updatedPrice = adjustPriceByCondition(price, condition);

        // Upload new image and usdzFile if provided
        const imageUrls = req.files['image'] ? req.files['image'].map(file => file.path) : [];
        const usdzFileUrl = req.files['usdzFile'] ? req.files['usdzFile'][0].path : '';

        const updateData = {
            title,
            description,
            price: updatedPrice,
            brand,
            size,
            condition,
        };

        // Update image and usdzFile only if new files are provided
        if (imageUrls.length > 0) updateData.image = imageUrls;
        if (usdzFileUrl) updateData.usdzFile = usdzFileUrl;

        const sneaker = await Sneaker.findByIdAndUpdate(sneakerId, updateData, { new: true });

        if (!sneaker) return res.status(404).json({ message: 'Sneaker not found' });

        res.json({ sneaker });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.deleteSneaker = async (req, res) => {
    const { sneakerId } = req.params;

    try {
        const sneaker = await Sneaker.findByIdAndDelete(sneakerId);

        if (!sneaker) return res.status(404).json({ message: 'Sneaker not found' });

        res.json({ message: 'Sneaker deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// exports.getAllSneakers = async (req, res) => {
//     try {
//         const sneakers = await Sneaker.find();
//         res.json({ sneakers });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

exports.getAllSneakers = async (req, res) => {
    try {
        // Use populate to fetch the 'userName' and '_id' fields from the 'User' collection
        const sneakers = await Sneaker.find()
            .populate({
                path: 'createdBy',
                select: '_id name' // Fetch both id and userName
            });

        // Format the response to ensure the createdBy object is properly structured
        const formattedSneakers = sneakers.map(sneaker => ({
            ...sneaker.toObject(),
            createdBy: sneaker.createdBy
                ? {
                      id: sneaker.createdBy._id, // Include id
                      name: sneaker.createdBy.name // Include userName
                  }
                : null // Handle cases where createdBy is missing
        }));

        res.json({ sneakers: formattedSneakers });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// exports.getAllApprovedSneakers = async (req, res) => {
//     try {
//         const sneakers = await Sneaker.find({ isApproved: true });
//         res.json({ sneakers });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

exports.getAllApprovedSneakers = async (req, res) => {
    try {
        // Use populate to fetch the 'userName' and '_id' fields from the 'User' collection
        const sneakers = await Sneaker.find({ isApproved: true })
            .populate({
                path: 'createdBy',
                select: '_id name' // Fetch both id and name
            });

        // Format the response to ensure the createdBy object is properly structured
        const formattedSneakers = sneakers.map(sneaker => ({
            ...sneaker.toObject(),
            createdBy: sneaker.createdBy
                ? {
                      id: sneaker.createdBy._id, // Include id
                      name: sneaker.createdBy.name // Include name
                  }
                : null // Handle cases where createdBy is missing
        }));

        res.json({ sneakers: formattedSneakers });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getSneakerById = async (req, res) => {
    const { sneakerId } = req.params;

    try {
        const sneaker = await Sneaker.findById(sneakerId);

        if (!sneaker) return res.status(404).json({ message: 'Sneaker not found' });

        res.json({ sneaker });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// exports.getSneakersByUser = async (req, res) => {
//     const { userId } = req.params; // Extract userId from URL parameters

//     try {
//         const sneakers = await Sneaker.find({ createdBy: req.user._id });
//         if (sneakers.length === 0) {
//             return res.status(404).json({ message: 'No sneakers found for this user' });
//         }
//         res.json({ sneakers });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

exports.getSneakersByUser = async (req, res) => {
    const { userId } = req.params; // Extract userId from URL parameters
    try {
        // Use populate to fetch the 'userName' and '_id' fields from the 'User' collection
        const sneakers = await Sneaker.find({ createdBy: req.user._id })
            .populate({
                path: 'createdBy',
                select: '_id name' // Fetch both id and name
            });

        if (sneakers.length === 0) {
            return res.status(404).json({ message: 'No sneakers found for this user' });
        }

        // Format the response to ensure the createdBy object is properly structured
        const formattedSneakers = sneakers.map(sneaker => ({
            ...sneaker.toObject(),
            createdBy: sneaker.createdBy
                ? {
                      id: sneaker.createdBy._id, // Include id
                      name: sneaker.createdBy.name // Include name
                  }
                : null // Handle cases where createdBy is missing
        }));

        res.json({ sneakers: formattedSneakers });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// const Sneaker = require('../models/sneaker.model');
const User = require('../models/user.model');

// Fetch Top Sellers with their Listed Sneakers
// exports.getTopSellers = async (req, res) => {
//     try {
//         // Aggregate sneakers grouped by their creators (users)
//         const topSellers = await Sneaker.aggregate([
//             // Match only approved sneakers
//             { $match: { isApproved: true } },

//             // Group by user (createdBy) and collect sneaker details
//             {
//                 $group: {
//                     _id: '$createdBy',  // Group by createdBy (user ID)
//                     sneakers: {
//                         $push: {
//                             _id: '$_id',
//                             title: '$title',
//                             description: '$description',  // Add description
//                             price: '$price',
//                             brand: '$brand',
//                             image: '$image',
//                             usdzFile: '$usdzFile',  // Add usdzFile
//                             condition: '$condition',
//                             size: '$size',
//                             createdBy: '$createdBy'  // Add createdBy
//                         }
//                     },
//                     totalListed: { $sum: 1 }, // Count total sneakers listed by each user
//                 }
//             },

//             // Perform a $lookup to populate user details from the User collection
//             {
//                 $lookup: {
//                     from: 'users',  // The name of the User collection
//                     localField: '_id',  // The field we are matching from the Sneaker's _id
//                     foreignField: '_id',  // The field we are matching in the User collection
//                     as: 'userDetails'  // Alias to store the populated data
//                 }
//             },

//             // Flatten the result (because $lookup gives an array)
//             {
//                 $unwind: {
//                     path: '$userDetails',
//                     preserveNullAndEmptyArrays: true // In case a user doesn't exist
//                 }
//             },

//             // Sort by total sneakers listed (descending order)
//             { $sort: { totalListed: -1 } }
//         ]);

//         topSellers.map(seller => {
//             seller.sneakers.map(sneaker => sneaker.size.toString())
//         })

//         res.status(200).json(topSellers);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };


exports.getTopSellers = async (req, res) => {
    try {
        // Aggregate sneakers grouped by their creators (users)
        const topSellers = await Sneaker.aggregate([
            // Match only approved sneakers
            { $match: { isApproved: true } },

            // Group by user (createdBy) and collect sneaker details
            {
                $group: {
                    _id: '$createdBy',  // Group by createdBy (user ID)
                    sneakers: {
                        $push: {
                            _id: '$_id',
                            title: '$title',
                            description: '$description',  // Add description
                            price: '$price',
                            brand: '$brand',
                            image: '$image',
                            usdzFile: '$usdzFile',  // Add usdzFile
                            condition: '$condition',
                            size: '$size',
                            // createdBy: '$createdBy'  // Add createdBy
                        }
                    },
                    totalListed: { $sum: 1 }, // Count total sneakers listed by each user
                }
            },

            // Perform a $lookup to populate user details from the User collection
            {
                $lookup: {
                    from: 'users',  // The name of the User collection
                    localField: '_id',  // The field we are matching from the Sneaker's _id
                    foreignField: '_id',  // The field we are matching in the User collection
                    as: 'userDetails'  // Alias to store the populated data
                }
            },

            // Flatten the result (because $lookup gives an array)
            {
                $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true // In case a user doesn't exist
                }
            },

            // Sort by total sneakers listed (descending order)
            { $sort: { totalListed: -1 } }
        ]);

        topSellers.map(seller => {
            seller.sneakers.map(sneaker => sneaker.size.toString())
        })

        res.status(200).json(topSellers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};