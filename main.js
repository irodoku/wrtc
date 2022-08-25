let peerConnection = new RTCPeerConnection(
    {'iceServers': [
            {'urls': 'stun:stun.services.mozilla.com'},
            {'urls': 'stun:stun.l.google.com:19302'},
            {'urls': 'turn:turn.anyfirewall.com:443?transport=tcp',
                credential: 'webrtc',
                username: 'webrtc'
            }
        ]
    }
)
let localStream;
let remoteStream;

let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
    remoteStream = new MediaStream()
    document.getElementById('id-1').srcObject = localStream
    document.getElementById('id-2').srcObject = remoteStream
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
        });
    };
}

let crearOferta = async () => {
    peerConnection.onicecandidate = async (event) => {
        if(event.candidate){
            document.getElementById('oferta-sdp').value = JSON.stringify(peerConnection.localDescription)
        }
    };
    const oferta = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(oferta);
}

let crearRespuesta = async () => {
    let oferta = JSON.parse(document.getElementById('oferta-sdp').value)
    peerConnection.onicecandidate = async (event) => {
        if(event.candidate){
            document.getElementById('respuesta-sdp').value = JSON.stringify(peerConnection.localDescription)
        }
    };
    await peerConnection.setRemoteDescription(oferta);
    let respuesta = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(respuesta);
}

let addAnswer = async () => {
    let respuesta = JSON.parse(document.getElementById('respuesta-sdp').value)
    if (!peerConnection.currentRemoteDescription){
        peerConnection.setRemoteDescription(respuesta);
    }
}

init()

document.getElementById('create-oferta').addEventListener('click', crearOferta)
document.getElementById('create-respuesta').addEventListener('click', crearRespuesta)
document.getElementById('add-respuesta').addEventListener('click', addAnswer)
