var users = []

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room)
        return { error: 'username or room name is required.' }

    const existingUser = users.find(user => user.room === room && user.username === username)

    if (!existingUser) {
        const user = { id, username, room }
        users.push(user)
        return { user }
    }

    return { error: 'username is already in use!' }

}

const removeUser = (id) => {

    const index = users.findIndex(user => user.id === id)

    if (index != -1)
        return users.splice(index, 1)[0]
}

const getUser = (id) => {
    return users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room)
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom }