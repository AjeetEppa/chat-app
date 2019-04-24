socket = io()

// Elements
$messageForm = document.querySelector('form')
$messageFormInput = $messageForm.querySelector('input')
$messageFormButton = $messageForm.querySelector('button')
$sendLocationButton = document.querySelector('#location')
$messages = document.querySelector('#messages')
$sidebar = document.querySelector('#sidebar')

// Templates
$messageTemplate = document.querySelector('#message-template').innerHTML
$locationTemplate = document.querySelector('#location-message-template').innerHTML
$sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// autoscroll

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible Height
    const visibleHeight = $messages.offsetHeight

    //height of the message container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    console.log(containerHeight, containerHeight - newMessageHeight, scrollOffset)
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('newData', ({ room, users }) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('message', (message) => {
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        text: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
    console.log(message)
})

socket.on('locationMessage', (locationObject) => {
    const html = Mustache.render($locationTemplate, {
        url: locationObject.url,
        username: locationObject.username,
        createdAt: moment(locationObject.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
    console.log(locationObject.url)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        if (error)
            return console.log(error)
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        console.log('Message Delivered!')
    })
})

$sendLocationButton.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        console.log("Your browser doesn't support Geolocation")
    }

    navigator.geolocation.getCurrentPosition((position) => {
        $sendLocationButton.setAttribute('disabled', 'disabled')

        const lat = position.coords.latitude
        const long = position.coords.longitude
        socket.emit('sendLocation', { lat, long }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error)
        alert(error)
        location.href = '/'
})

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')

//     socket.emit('increment')
// })
