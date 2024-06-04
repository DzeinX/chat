import React, {useRef, useState} from "react";
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import {useAuthState} from "react-firebase-hooks/auth";
import {useCollectionData} from "react-firebase-hooks/firestore";

const initializeApp = {
  apiKey: "AIzaSyBXBJvnOtYExpJmjM7P0AJAMV_XjGJip3s",
  authDomain: "chat-80794.firebaseapp.com",
  projectId: "chat-80794",
  storageBucket: "chat-80794.appspot.com",
  messagingSenderId: "557064973877",
  appId: "1:557064973877:web:a1af2c4e3b1ff2e9650b7c",
  measurementId: "G-PW7SRLWZWL"
};

const firebaseApp = firebase.initializeApp(initializeApp);

const auth = firebaseApp.auth();
const firestore = firebaseApp.firestore();

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in</button>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatMessage(props) {
  const {text, uid, photoURL} = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt=""/>
      <p>{text}</p>
    </div>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    console.log(auth.currentUser)

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input className="sendInput" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="New message..." />

      <button type="submit" disabled={!formValue}>Send</button>

    </form>
  </>)
}


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>NewChat</h1>
        {user ? <SignOut /> : <SignIn />}
      </header>

      <section>
        {user ? <ChatRoom /> : (
          <div className="startMessage">
            <div className="welcome">Welcome to NewChat!</div>
            <div className="start">Sign in to start messaging</div>
          </div>
        )}
      </section>

    </div>
  );
}

export default App;
