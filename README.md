# peer2show
Hobby project of a real-time peer-to-peer interactive slideshow app based on WebRTC.

The way it works:
1. Alice loads the webpage and creates a new room.
2. Alice shares the unique link to her room with participants - Bob and Charlie
3. Bob and Charlie use the link shared by Alice to join the room using web UI

Until now all the signalling communication (room creation, participant joins) is happening via a session broker. Once the participant join a room, their respective web app instances create a peer-to-peer connection (RTCPeerConnection) using WebRTC technology.

4. Alice loads the images (using drag/drop or open file dialog)
5. The images are transferred and displayed to Bob and Charlie
7. Alice navigates through the slideshow (next/previous image) or zooms-in our out to see particiluar details within the photo
8. Bob and Charlie see exactly what Alice sees and displays
9. Throught the slideshow the peers can exchange some messages using built-in chat
10. Once finished, Alice closes the session, which automatically terminates it for Bob and Charlie too

All the data exchange in the steps 4-10 occurs in purely peer-to-peer fashion based.
Depending on the NAT configuration, the data exchange occurs directly between peers using STUN (Session Traversal Utilities for NAT) or via a relay server using TURN (Traversal Using Relays around NAT)

<br/>Under the hood the web app:
- compresses the images to a suitable web resolution in order to speed up the data transfer
- transfers the image files to the peers through the established channels (DataChannel). **The images are not transferred via any central server!**
- exchanges all the slideshow control data (next/previous/zoom-in/zoom-out/pan) and the operations are applied on all peers' instances 
- sends and received chat messages

## UI
Below you can see an example of the slideshow UI
![UI example](https://github.com/pitC/peer2show/blob/6fe41a119b17c1aacb03fef8238c4759eb3429d3/doc/ui-scr-1.PNG)

Current image is displayed in the centre of the screen with navigation buttons at the top and the panel on the right showing:
- list of the participants with their status of the file transfer
- chat
- preview of all images in the slideshow

## Architecture
![High level architecture](https://github.com/pitC/peer2show/blob/803d1e80bb022aa94ac6ac592e0c9c7e4ca8ac08/doc/diagram.svg)
