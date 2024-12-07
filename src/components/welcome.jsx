import logo from '../assets/wolflogo.png';

function Welcome({ onJoinClick }) {
    return (
        <>
            <img alt="logo" src={logo} id="logo1"></img>
            <h1>BIGGEST E-COMMERCE SERVICE IN PAKISTAN</h1>
            <button onClick={onJoinClick}>Join Now</button>
        </>
    );
}

export default Welcome;
