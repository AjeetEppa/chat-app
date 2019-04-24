const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, {lat, long}) => {
    return {
        username,
        url: `https:maps.google.com/?q=${lat},${long}`,
        createdAt: new Date().getTime()
    }
}

module.exports = { generateMessage, generateLocationMessage }