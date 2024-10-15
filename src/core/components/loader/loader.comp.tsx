import "./loader.scss";

export function Loader() {
  return (
    <div className="loader-container">
      <div className="loader"></div>
      <div className="loading">
        Loading
        <span className="dotDark-one"> .</span>
        <span className="dotDark-two"> .</span>
        <span className="dotDark-three"> .</span>
      </div>
      {/* <div className="lds-roller">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div> */}
    </div>
  );
}
