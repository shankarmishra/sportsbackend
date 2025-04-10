const axios = require('axios');
const User = require('../src/models/userModel'); // Fixed model path to match actual usage

const GOOGLE_MAPS_API = process.env.GOOGLE_MAPS_API;

// Get coordinates (latitude, longitude) from a given address
module.exports.getCoordinatesFromAddress = async (address) => {
    if (!address) throw new Error('Address is required');

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API}`;

    try {
        const response = await axios.get(url);
        const { results, status } = response.data;

        if (status === 'OK' && results.length > 0) {
            const { lat, lng } = results[0].geometry.location;
            return { lat, lng };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error('Error getting coordinates:', error.message);
        throw error;
    }
};

// Get distance and travel time between two addresses
module.exports.getDistanceAndTime = async (originAddress, destinationAddress) => {
    if (!originAddress || !destinationAddress) {
        throw new Error('Origin and destination are required');
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(originAddress)}&destinations=${encodeURIComponent(destinationAddress)}&key=${GOOGLE_MAPS_API}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        const element = data?.rows?.[0]?.elements?.[0];
        if (data.status === 'OK' && element.status === 'OK') {
            return {
                distance: element.distance,
                duration: element.duration
            };
        } else {
            throw new Error('Unable to fetch distance and time');
        }
    } catch (error) {
        console.error('Error getting distance and time:', error.message);
        throw error;
    }
};

// Get Google Maps autocomplete location suggestions
module.exports.getPlaceSuggestions = async (input) => {
    if (!input) throw new Error('Input is required');

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API}`;

    try {
        const response = await axios.get(url);
        const { status, predictions } = response.data;

        if (status === 'OK') {
            return predictions.map(p => p.description).filter(Boolean);
        } else {
            throw new Error('Unable to fetch suggestions');
        }
    } catch (error) {
        console.error('Error getting autocomplete suggestions:', error.message);
        throw error;
    }
};

// Find nearby users within a given radius (in km)
module.exports.getNearbyUsers = async (lat, lng, radiusKm, game = null) => {
    if (!lat || !lng || !radiusKm) {
        throw new Error('Latitude, longitude, and radius are required');
    }

    try {
        const query = {
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    $maxDistance: radiusKm * 1000 // Convert km to meters
                }
            }
        };

        // Add game filter if provided
        if (game) {
            query.favoriteGames = game;
            query.role = "player";
        }

        const nearbyUsers = await User.find(query);
        return nearbyUsers;
    } catch (error) {
        console.error('Error finding nearby users:', error.message);
        throw error;
    }
};
