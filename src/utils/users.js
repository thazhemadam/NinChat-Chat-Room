let usersActive = []
//Created to handle users.

const addUser = ({id,username, room}) => {
    //Clean how the data looks.
    username = username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //Validate Data
    if(!username || !room){
        return {
            error: 'Username and Room are required.'
        }
    }

    //Check for existing user 
    const duplicateUser = usersActive.find((existingUser)=>{
        return existingUser.room === room && existingUser.username === username
    })

    //Prevent duplicates
    if(duplicateUser){
        return {error: "Username is in use."}
    }

    //Store user.
    const newUser = {id, username, room}
    usersActive.push(newUser)
    return {newUser}
}

//Remove an active user. 
const removeUser = (id) => {
    const removeIndex = usersActive.findIndex((existingUser)=> existingUser.id === id)
    if(removeIndex!==-1){
        return usersActive.splice(removeIndex, 1)[0]
    }
}

//Find an active user by id.
const getUser = (id) => {
    const user = usersActive.find((eachActiveUser)=> eachActiveUser.id === id)
    if(user === undefined)
        return {username: undefined, room:undefined}
    return user
}

//Find all the users in a room.
const getUsersInRoom = (roomName) => {
    return usersActive.filter((eachActiveUser)=> eachActiveUser.room === roomName)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}