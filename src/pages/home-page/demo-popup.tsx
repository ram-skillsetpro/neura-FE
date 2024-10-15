import listView from "assets/images/list-view.png";
import React from "react";

interface DemoPopupProps {
  showDemoPopup: boolean;
  onClose: () => void;
}

const DemoPopup: React.FC<DemoPopupProps> = ({ showDemoPopup, onClose }) => {
  return (
    <>
      {showDemoPopup && (
        <div className="popup-container" id="demo-popup">
          <div className="popup" id="">
            <div className="wrapper">
              <div className="close-popups" onClick={onClose}></div>
              <div className="inner-wrapper">
                <div className="popup-slide">
                  <div className="popup-slide-text">
                    <h3>The Future of Contract Management is here.</h3>
                  </div>
                  <div className="popup-slide-image">
                    <div className="popup-slide-image-container">
                      <img src={listView} alt="list view preview" />
                    </div>
                  </div>
                  <div className="popup-slide-text">
                    <p>
                    </p>
                  </div>
                </div>
                <div className="popup-form">
                  <div className="popup-form-wrapper">
                    <div className="logo"></div>
                    <div className="text">
                      <h4>Welcome!</h4>
                      <p>Leave your details and we will schedule a demo! </p>
                    </div>
                    <div className="popup-form-container">
                      <form>
                        <label htmlFor="name">Name</label>
                        <input type="text" name="name" value="" placeholder="" tabIndex={1} />
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" value="" placeholder="" tabIndex={2} />
                        <p className="controls">
                          <span className="remember">
                            <input type="checkbox" name="terms" id="terms" tabIndex={3} />
                            <label className="checkbox-label" htmlFor="terms">
                              I agree to the <a href="">Terms and Conditions</a>
                            </label>
                          </span>
                        </p>
                        <input
                          type="button"
                          name="submit"
                          value="Get a Demo"
                          placeholder=""
                          tabIndex={4}
                        />
                      </form>
                    </div>
                    <div className="text">
                      <p>
                        I have already made up my mind to&nbsp;
                        <a href="">Sign Up</a>
                        &nbsp;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DemoPopup;
