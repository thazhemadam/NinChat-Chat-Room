const socket = io()

//Elements
const $messageForm = document.getElementById('message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.getElementById('send-location')
const $messagesTemplateArea = document.getElementById('messageTemplateArea')
const $sidebarTemplateArea = document.getElementById('sidebarTemplateArea')

//Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const locationMessageTemplate = document.getElementById('location-message-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML


const autoscroll = () => {
    //New message element
    const $newMessage = $messagesTemplateArea.lastElementChild

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messagesTemplateArea.offsetHeight

    //Height of messages container
    const containerHeight = $messagesTemplateArea.scrollHeight

    //How far have you scrolled?
    const scrollOffset = $messagesTemplateArea.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight<=scrollOffset){
        $messagesTemplateArea.scrollTop = $messagesTemplateArea.scrollHeight
    }
}

//Query Options
const {username, room} = Qs.parse(location.search.toLowerCase(), {ignoreQueryPrefix:true})
//Message Form and Button
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
     
    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value
    if(message === ''){
        $messageFormButton.removeAttribute('disabled')
        return console.log('Please enter a message.')
    }

    socket.emit('sendMessage', message, (badwordsError)=>{
    
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(badwordsError){
            if(badwordsError ==='Not recognized'){
                location.href = '/'
                console.log(badwordsError)
            }
            else{
                return console.log(badwordsError)
            }
        }
    })
})  

socket.on('message',(message, sender)=>{
    // console.log(message.text)
    const html = Mustache.render(messageTemplate,{
                                                    User: sender,
                                                    messageTime: moment(message.createdAt).format('h:mm a'),
                                                    messageDisplay:message.text
                                                })
    $messagesTemplateArea.insertAdjacentHTML('beforeend',html)
    autoscroll()
}) 


$locationButton.addEventListener("click", () => {
    if(!navigator.geolocation){
        return alert('Sorry, Geolocation is not supported by your browser.')
    }

    $locationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation',{
                latitude: position.coords.latitude,
                longitude:position.coords.longitude
        }, ()=>{
            $locationButton.removeAttribute('disabled')
            console.log('Location Registered.')
        })
    }, (err)=>{
        alert('Sorry. An error occured.')
        $locationButton.removeAttribute('disabled')
        console.warn(`ERROR(${err.code}): ${err.message}`);
    })

})


socket.on('locationMessage', (locationMessage, User)=>{
    // console.log(locationMessage.url)  
    const html = Mustache.render(locationMessageTemplate,{
                                                                User,
                                                                locationMessageTime:moment(locationMessage.createdAt).format('h:mm a'),
                                                                locationMessageDisplay:locationMessage.url
                                                            })
    $messagesTemplateArea.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.emit('join',{username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData',({ roomName, usersInRoom })=>{
    // console.log({roomName, usersInRoom})
    const html = Mustache.render(sidebarTemplate, {
                                                        roomName,
                                                        usersInRoom
                                                    })
    $sidebarTemplateArea.innerHTML = html
})
