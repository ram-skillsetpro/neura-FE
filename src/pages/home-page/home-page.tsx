import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import simpleoAiLogo from "src/assets/images/simpleo-ai-logo-reverse@4x.png";
import { ROUTE_ADMIN, ROUTE_DASHBOARD, ROUTE_TEAMS_DRIVE, ROUTE_USER_DASHBOARD } from "src/const";
import { useAppSelector } from "src/core/hook";
import { AuthReducer } from "src/pages/auth/auth.redux";
import DemoPopup from "./demo-popup";
import "./home-page.scss";

const Homepage: React.FC = () => {
  const navigate = useNavigate();

  const [showDemoPopup, setShowDemoPopup] = useState<boolean>(false);

  const [activeScrollerSlide, setActiveScrollerSlide] = useState(0);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const authData = JSON.parse(localStorage.getItem("auth") || "{}");
  const defaultPage = authData?.dfp ? authData.dfp : "";

  const handleScrollerSlideClick = (index: number) => {
    setActiveScrollerSlide(index);
  };

  const handleDemoButtonClick = () => {
    setShowDemoPopup(true);
  };

  const handleClosePopups = () => {
    setShowDemoPopup(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      if (authData?.ef && authData?.ev) {
        if (defaultPage === "dashboard") {
          navigate(`${ROUTE_ADMIN}/${ROUTE_DASHBOARD}`);
        } else if (defaultPage === "mydrive") {
          navigate(`${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}`);
        } else {
          navigate(`${ROUTE_ADMIN}/${ROUTE_TEAMS_DRIVE}`);
        }
      }
    }
    // if (isLoggedIn) navigate(`${ROUTE_ADMIN}/${ROUTE_CONTRACT_LIST}`);

    // TODO: handle for isLoggedIn returns false
  }, [isLoggedIn]);

  return (
    <>
      {/* Slides */}
      <div className="slide slide-hero">
        <div className="wrapper">
          <div className="inner-wrapper">
            <h1>
              Contract Lifecycle Management - Made Simple, Intelligent, Super Fast and Comprehensive
              with AI
            </h1>
            <h2>Risks, Obligations, SLA and many more…..</h2>
            <p>
              Harness the power of our legal grade, AI-based enterprise solution to address the
              challenges of end to end contract lifecycle management in your organization.
            </p>
            <p>
              <a className="button button-red" id="demobutton-2" onClick={handleDemoButtonClick}>
                Get a Demo
              </a>
            </p>
          </div>
        </div>
      </div>
      {/* 
      <div className="slide slide-roller">
        <div className="wrapper">
          <div className="inner-wrapper">
            <h2>Accelerate contract negotiations for your teams</h2>
            <div className="scroller">
              <div className="scroller-text">
                <div
                  className={`scroller-slide ${activeScrollerSlide === 0 ? "open" : ""}`}
                  onClick={() => handleScrollerSlideClick(0)}
                >
                  <p>SimpleO.AI for Legal</p>
                  <h3>Slash negotiation times</h3>
                  <div className="scroller-slide-content">
                    <p>
                    </p>
                    <p>
                      <a
                        className="button button-red-outline"
                        id="demobutton-2"
                        onClick={handleDemoButtonClick}
                      >
                        Explore Contract Playbooks
                      </a>
                    </p>
                  </div>
                </div>
                <div
                  className={`scroller-slide ${activeScrollerSlide === 1 ? "open" : ""}`}
                  onClick={() => handleScrollerSlideClick(1)}
                >
                  <p>SimpleO.AI for Legal</p>
                  <h3>Slash negotiation times</h3>
                  <div className="scroller-slide-content">
                    <p>
                      Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac
                      turpis egestas. Etiam laoreet imperdiet risus, nec egestas dolor ullamcorper
                      at. Praesent sollicitudin nulla sollicitudin, luctus purus id, posuere dui.
                    </p>
                    <p>
                      <a
                        className="button button-red-outline"
                        id="demobutton-2"
                        onClick={handleDemoButtonClick}
                      >
                        Explore Contract Playbooks
                      </a>
                    </p>
                  </div>
                </div>
                <div
                  className={`scroller-slide ${activeScrollerSlide === 2 ? "open" : ""}`}
                  onClick={() => handleScrollerSlideClick(2)}
                >
                  <p>SimpleO.AI for Legal</p>
                  <h3>Slash negotiation times</h3>
                  <div className="scroller-slide-content">
                    <p>
                      Malesuada fames ac turpis egestas. Etiam laoreet imperdiet risus, nec egestas
                      dolor ullamcorper at. Praesent sollicitudin nulla sollicitudin, luctus purus
                      id, posuere dui.
                    </p>
                    <p>
                      <a
                        className="button button-red-outline"
                        id="demobutton-2"
                        onClick={handleDemoButtonClick}
                      >
                        Explore Contract Playbooks
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="scroller-image">
                <div
                  className={`scroller-image-container ${activeScrollerSlide === 0 ? "open" : ""}`}
                >
                  <img src={searchView} alt="list view preview" />
                </div>
                <div
                  className={`scroller-image-container ${activeScrollerSlide === 1 ? "open" : ""}`}
                >
                  <img src={listView} alt="list view preview" />
                </div>
                <div
                  className={`scroller-image-container ${activeScrollerSlide === 2 ? "open" : ""}`}
                >
                  <img src={chatView} alt="list view preview" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className="slide slide-normal" style={{ background: "#c6cdd4" }}>
        <div className="wrapper">
          <div className="inner-wrapper why-sec">
            <h1>
              SimpleO comes with an intelligent Co-Pilot for your organizations to help you with
              every task related to contract management
            </h1>
            <p>
              SimpleO’s AI simplifies every stage of the contract management lifecycle for your
              organization and makes it more efficient, mitigates contractual risks and manages
              contractual obligations easily.
            </p>
            <p>(So, advanced, it's simple)</p>
          </div>
        </div>
      </div>

      {/* Boilerplate */}
      {/* <div className="boilerplate">
        <div className="wrapper">
          <div className="inner-wrapper">
            <div className="boilerplate-logo">
              <p>
                <img
                  src="https://simpleo-user-static.s3.us-west-1.amazonaws.com/webassets/images/simpleo-ai-logo.svg"
                  className="boilerplate-logo"
                  alt="SimpleO.ai Logo"
                />
              </p>
              <p>4221 Lilac Ridge Rd.San RamonCA 94582</p>
            </div>
            <div className="boilerplate-lists">
              <ul>
                <li>
                  <a>Platform</a>
                  <ul>
                    <li>
                      <a>Technology</a>
                    </li>
                    <li>
                      <a>Contract Playbooks</a>
                    </li>
                    <li>
                      <a>Security</a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a>Solutions</a>
                  <ul>
                    <li>
                      <a>Overview</a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a>Resources</a>
                  <ul>
                    <li>
                      <a>Blog</a>
                    </li>
                    <li>
                      <a>Case Studies</a>
                    </li>
                    <li>
                      <a>Events</a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a>Company</a>
                  <ul>
                    <li>
                      <a>Our Story</a>
                    </li>
                    <li>
                      <a>Careers</a>
                    </li>
                    <li>
                      <a>Press</a>
                    </li>
                    <li>
                      <a>Contact Us</a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
          <div className="inner-wrapper">
            <p>
              &copy; 2023 SimpleO.ai, All Rights Reserved. | <a>Privacy Policy</a> |{" "}
              <a>Terms of Service</a> | <a>Data Processing Addendum</a>
            </p>
          </div>
        </div>
      </div> */}
      <footer className="footer-bg">
        <div className="footer-wrap">
          <div className="footer-top-sec">
            <div className="ft-address-sec">
              <div className="ft-logo">
                <a href="#">
                  <img
                    src="https://simpleo-user-static.s3.us-west-1.amazonaws.com/webassets/images/simpleo-ai-logo.svg"
                    alt=""
                  />
                </a>
              </div>
              <div className="ft-address-info">
                <p>
                  4221 Lilac Ridge Rd.San Ramon
                  <strong> CA 94582</strong>
                </p>
              </div>
            </div>
            <div className="ft-logo-sec">
              <div className="ft-cmp-logo">
                <ul>
                  <li>
                    <img
                      src="https://simpleo-user-static.s3.us-west-1.amazonaws.com/webassets/images/home/soc2-seal.svg"
                      alt=""
                    />
                  </li>
                  <li>
                    <img
                      src="https://simpleo-user-static.s3.us-west-1.amazonaws.com/webassets/images/home/ISOcompliance_seal_1.svg"
                      alt=""
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-6">
            <div className="flex justify-between">
              <div className="ft-copywrite">
                SimpleO.ai &copy; 2024. All Rights Reserve
                <a href="https://www.simpleo.ai/legal/privacy-policy">Privacy Policy</a>
                <a href="https://www.simpleo.ai/legal/terms-conditions">Terms of Service</a>
              </div>
              <div className="social-sec">
                <ul>
                  <li>
                    <a
                      href="https://www.instagram.com/simpleo_ai/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src="https://simpleo-user-static.s3.us-west-1.amazonaws.com/webassets/images/instagram.png"
                        alt=""
                      />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.linkedin.com/company/simpleo-ai/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src="https://simpleo-user-static.s3.us-west-1.amazonaws.com/webassets/images/linkedin.svg"
                        alt=""
                      />
                    </a>
                  </li>
                  <li>
                    <a href="https://twitter.com/simpleo_ai" target="_blank" rel="noreferrer">
                      <img
                        src="https://simpleo-user-static.s3.us-west-1.amazonaws.com/webassets/images/twitter.svg"
                        alt=""
                      />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.youtube.com/@SimpleOAI" target="_blank" rel="noreferrer">
                      <img
                        src="https://simpleo-user-static.s3.us-west-1.amazonaws.com/webassets/images/youtube.svg"
                        alt=""
                      />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <DemoPopup showDemoPopup={showDemoPopup} onClose={handleClosePopups} />
    </>
  );
};

export default Homepage;

export const reducer = {
  auth: AuthReducer,
};
