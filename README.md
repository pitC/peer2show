# peer2show
Hobby project of a real-time peer-to-peer interactive slideshow app based on WebRTC.

The way it works:
1. Alice loads the webpage and creates a new room
2. Alice shares the unique link to her room with participants - Bob and Charlie
3. Bob and Charlie join the room using the shared link

*Until now all the signalling communication (room creation, participant joins) is happening via a central session broker service. Once the participant join a room, their respective web app instances create a peer-to-peer connection (RTCPeerConnection) using WebRTC.*

4. Alice uploads the images (using drag/drop or open file dialog)
5. The images are transferred and displayed to Bob and Charlie
7. Alice navigates through the slideshow (next/previous image) or zooms-in/pans to see particiluar details within the photo
8. Displayed image is synced to Bob and Charlie sessions
9. Through the slideshow the peers can exchange messages using the built-in chat
10. Once finished, Alice closes the session, which automatically terminates it for Bob and Charlie too

*All the data exchange in the steps 4-10 occurs in purely peer-to-peer fashion.
Depending on the network NAT configuration, it might go directly between peers using STUN (Session Traversal Utilities for NAT) or via a relay server using TURN (Traversal Using Relays around NAT).*

<br/>
Under the hood the web app:
- compresses the images to a suitable web resolution in order to speed up the data transfer
- transfers the image files to the peers through the established channels (DataChannel). **The images are not transferred via any central server!**
- exchanges all the slideshow control data (next/previous/zoom-in/zoom-out/pan) and the operations are applied on all peers' instances 
- sends and receives chat messages

## UI
Below you can see an example of the slideshow UI
![UI starting page](https://github.com/pitC/peer2show/blob/9acc54a267a83a40e609453a4eeb0dc36e5ce6ab/doc/ui-screen-0.png)
![UI slideshow](https://github.com/pitC/peer2show/blob/9acc54a267a83a40e609453a4eeb0dc36e5ce6ab/doc/ui-screen-1.png)

Current image is displayed in the centre of the screen with navigation buttons at the top and the panel on the right showing:
- list of the participants with their status of the file transfer
- chat
- preview of all images in the slideshow

## Architecture
![High level architecture](https://github.com/pitC/peer2show/blob/803d1e80bb022aa94ac6ac592e0c9c7e4ca8ac08/doc/diagram.svg)
